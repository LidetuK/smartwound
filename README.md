Smart Wound - Full Technical & Strategic Documentation
Overview
Smart Wound is an AI-assisted wound care companion app designed to simplify and improve self-managed wound care. The product leverages existing AI APIs (e.g., GPT-4, Google Vision) to offer guidance, progress tracking, and access to healthcare resources without attempting to replace clinical diagnosis.
This documentation outlines the vision, strengths, risks, and a complete development plan using a hybrid stack of React (frontend), Node.js (backend), MongoDB (for unstructured data), and PostgreSQL (for structured data).

1. Core Vision
What Smart Wound Is:
An AI-assisted wound care companion app.


Combines LLMs (e.g., GPT-4, Claude) with image recognition APIs (e.g., Google Vision API).


Helps users:


Identify basic wound types


Get safe care guidance


Track wound healing with daily photos


Receive smart reminders


Connect with doctors or a peer community



What It Is Not:
A diagnostic tool


A medical replacement


A custom AI model trainer (no proprietary models at this stage)


Target Users:
People in rural or low-access areas


Elderly, diabetic, or chronic wound patients


NGO-run healthcare centers



2. Tech Stack
Frontend:
React with Tailwind CSS


PWA-capable


Responsive UI/UX for mobile-first


Backend:
Node.js with Express


Databases:
MongoDB (Unstructured data):


Wound logs


Chat sessions


Forum posts


User reminders


PostgreSQL (Structured data):


Users


Clinics


Escalation logs


Moderation flags


Billing and subscriptions


APIs:
GPT-4 or Claude (via OpenAI or Anthropic)


Google Vision API (pre-trained) for Beta


Google Maps API (for clinic locator)


Cloudinary or Firebase Storage for image hosting



3. Core Features & Modules
1. Wound Photo Check
Upload a photo


Analyze with Google Vision API


Classify (burn, scrape, ulcer, etc.)


Trigger alert for severe wounds


Disclaimer shown before analysis


2. GPT-Powered Chatbot
Powered by GPT-4 or Claude


FAQ and general wound advice


Reinforce: "This is not a diagnosis."


Conversation history saved


3. Healing Tracker
Daily photo upload


Timestamped notes


Progress chart (frontend graph)


Smart reminders: re-cleaning, dressing, check-ins


Trigger alert if no improvement in X days


4. Doctor Finder & Escalation
Integrate Google Maps for clinic search


Escalation logic:


Non-healing wounds after 5+ days


Image classified as severe


Key symptoms (pus, swelling, fever)


“Book a Doctor” CTA always visible





5. Community Forum
Anonymous peer Q&A


AI and human moderation


Chat grouping: General, By wound type, Language


Admin tools for flagging/removing posts


6. Admin/Clinics Dashboard
View wound logs


Get notified of risk triggers


Message users (telehealth)



4. Development Roadmap
Phase 1: Planning & Setup
Define MVP features


Prepare UI wireframes


Set up GitHub, CI/CD, staging environment


Phase 2: Core Modules
Vision API integration for image classification


GPT chatbot integration with disclaimer and context restrictions


User registration/login (email, phone, OAuth)


MongoDB schema for wound tracking


PostgreSQL schema for users, clinics, moderation, billing


Phase 3: Functionality Buildout
Healing tracker + reminder logic


Escalation triggers


Google Maps integration


Community chat & moderation filters


Admin dashboard for NGOs/Clinics


Phase 4: Testing & Pilot
Onboard 50 test users (e.g., from a diabetes clinic)


Collect feedback on trust, usability, and improvement


Fix edge case failures in image prediction


Adjust escalation timing/accuracy


Phase 5: Revenue Hooks
Free: Photo tracking, chatbot, community


Premium:


Telehealth consults


Wound care supply delivery


B2B:


NGO or clinic dashboard for remote monitoring


Patient data export/alerts



5. Privacy, Ethics, & Safety
Data Privacy
Full GDPR-style consent


Option to delete data anytime


No location tracking without consent


Disclaimers
Show before image upload or chatbot use


Repeated inside UI/UX to reinforce boundaries


Safety Nets
Escalate if system is unsure


Do not proceed with analysis without showing disclaimer


Community moderated by real humans



6. Budget & Costs
APIs
GPT-4: ~$0.01–$0.03 per chat


Google Vision API: 1,000 images/month free, then ~$1.50/1,000


Google Maps: Free up to 28,000 loads/month



Hosting
Render / Vercel for web frontend


Railway for backend


Optional Tools
PostHog / Mixpanel for usage tracking


Stripe for premium billing



7. Goals
We are not creating cutting-edge medical AI. We are:
Delivering guidance that helps users act sooner


Helping people avoid infection and worsening wounds


Giving users daily structure and peace of mind


Building a safe digital space to feel supported




