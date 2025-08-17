import { Groq } from "groq-sdk";
import dotenv from 'dotenv';
import Wound from '../models/wound.model.js';
import WoundLog from '../models/woundlog.model.js';
import { Op } from 'sequelize';
dotenv.config();

// Initialize Groq client only if API key is available
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

const systemPrompt = `
You are a helpful AI assistant for Smart Wound, a wound care companion app.
Your goal is to provide safe, general, and non-diagnostic advice about wound care.

You must adhere to the following rules at all times:
1.  **DO NOT PROVIDE A DIAGNOSIS.** Never, under any circumstances, try to diagnose the wound. You are not a doctor.
2.  **ALWAYS INCLUDE A DISCLAIMER.** In every single response, you must include this exact sentence: "This is not a medical diagnosis. Please consult a healthcare professional for any medical concerns."
3.  **Encourage Professional Help.** If the user describes symptoms that could be serious (e.g., pus, fever, severe pain, spreading redness), your primary response should be to strongly advise them to see a doctor immediately.
4.  **Use Safe Language.** Use phrases like "Generally, for a wound like this..." or "Common advice for scrapes includes..." Avoid definitive statements.
5.  **Be Supportive and Calm.** Your tone should be reassuring and supportive, not alarming.
6.  **Keep it Concise.** Provide clear, actionable, and easy-to-understand information.

You have access to the following context about the user's wounds:
{wound_context}

Use this context to provide more relevant and personalized advice, but still maintain all safety guidelines above.
`;

export const handleChat = async (req, res) => {
  try {
    // Check if Groq client is available
    if (!groq) {
      return res.status(503).json({ 
        error: 'Chatbot service is not available. GROQ_API_KEY is not configured.' 
      });
    }

    const { message, context = {}, history = [] } = req.body;
    const userId = req.user?.id; // Assuming user ID is available from auth middleware

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Fetch user's wound data for context
    let woundContext = "No wound data available.";
    
    if (userId) {
      try {
        const wounds = await Wound.findAll({
          where: { user_id: userId },
          order: [['created_at', 'DESC']],
          limit: 5 // Get latest 5 wounds
        });

        if (wounds.length > 0) {
          const woundSummaries = await Promise.all(wounds.map(async (wound) => {
            const logs = await WoundLog.findAll({
              where: { wound_id: wound.id },
              order: [['created_at', 'DESC']]
            });
            
            const daysTracked = Math.floor((new Date() - new Date(wound.created_at)) / (1000 * 60 * 60 * 24));
            
            return `- ${wound.type} (${wound.severity} severity): Created ${daysTracked} days ago, Status: ${wound.status}${wound.notes ? `, Notes: "${wound.notes}"` : ''}, Healing logs: ${logs.length}`;
          }));
          
          woundContext = `Current wounds being tracked:\n${woundSummaries.join('\n')}`;
        }
      } catch (error) {
        console.error('Error fetching wound context:', error);
        woundContext = "Unable to fetch wound data.";
      }
    }

    // Replace context placeholders in system prompt
    const contextualizedPrompt = systemPrompt
      .replace("{wound_context}", woundContext);

    const messages = [
      {
        role: 'system',
        content: contextualizedPrompt,
      },
      ...history, // Add past conversation history
      {
        role: 'user',
        content: message,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
    });

    res.json({
      reply: chatCompletion.choices[0]?.message?.content || '',
    });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Failed to get a response from the chatbot.' });
  }
}; 