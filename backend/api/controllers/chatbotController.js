import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
`;

export const handleChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...history, // Add past conversation history
      {
        role: 'user',
        content: message,
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama3-8b-8192', // Or another model like 'mixtral-8x7b-32768'
    });

    res.json({
      reply: chatCompletion.choices[0]?.message?.content || '',
    });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Failed to get a response from the chatbot.' });
  }
}; 