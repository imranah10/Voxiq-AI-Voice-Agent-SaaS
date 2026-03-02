require('dotenv').config();
const axios = require('axios');

// VAPI API URL and your private API key
const VAPI_BASE_URL = 'https://api.vapi.ai/assistant';
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY; // 'YOUR_VAPI_API_KEY_HERE'

async function createTenantAssistant(companyName, companyRules) {
  try {
    const payload = {
      // 1. The Voice: You can pick any High-Quality human voice from ElevenLabs/PlayHT
      voice: {
        provider: "playht",
        voiceId: "jennifer", // This is just an example, Vapi has Hindi voices too!
      },
      // 2. The Model: We use Groq (Llama-3) because it is ultra-fast and supports Hindi/English
      model: {
        model: "llama-3-8b-8192", // Groq's fast model
        provider: "groq",
        temperature: 0.7,
        maxTokens: 150,
        // DYNAMIC PROMPT: This is where we inject the company's specific rules!
        messages: [
          {
            role: "system",
            content: `You are a real human customer care agent for the company: "${companyName}". 
            Be polite, natural, and use a conversational tone. Mix both Hindi and English smoothly.
            
            COMPANY RULES AND KNOWLEDGE:
            ${companyRules}
            
            INSTRUCTIONS:
            1. Never mention you are an AI.
            2. Take details naturally.
            3. Do not read long paragraphs.
            `
          }
        ]
      },
      // 3. The initial greeting (Dynamic)
      firstMessage: `Namaste! Main ${companyName} se baat kar rahi hoon. Main aapki kya sahayata kar sakti hoon?`,
      name: `${companyName} Agent`
    };

    console.log(`🚀 Creating AI Assistant for: ${companyName}...`);
    const response = await axios.post(VAPI_BASE_URL, payload, {
      headers: {
        'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Success! Assistant created for ${companyName}.`);
    console.log(`🔑 ASSISTANT ID: ${response.data.id}`);
    
    return response.data;
  } catch (error) {
    console.error("❌ Failed to create Assistant:", error.response ? error.response.data : error.message);
  }
}

// ---------------------------------------------------------
// SaaS SIMULATION: Imagine a client just signed up on your website
// ---------------------------------------------------------
const newClientData = {
  companyName: "Dentist Smile Care",
  companyRules: "We are open Monday to Friday, 9AM to 5PM. A teeth cleaning costs 1000 INR."
};

// Start the function if API Key is set
if (!VAPI_PRIVATE_KEY) {
  console.log("⚠️ PLEASE SET 'VAPI_PRIVATE_KEY' IN YOUR .env FILE.");
  console.log("→ Go to Vapi.ai Dashboard > API Keys > Copy your 'Private API Key'.");
} else {
  createTenantAssistant(newClientData.companyName, newClientData.companyRules);
}
