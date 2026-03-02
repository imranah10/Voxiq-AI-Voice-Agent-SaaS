require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const auth = require('./middleware/auth');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

const VAPI_BASE_URL = 'https://api.vapi.ai';
const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;

// Basic Route for Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Voxiq Backend API is running perfectly.' });
});

// APIs
app.use('/api/auth', require('./routes/auth'));

// ---------------------------------------------------------
// 1. ENDPOINT: Create a New AI Assistant for a Company
// ---------------------------------------------------------
app.post('/api/saas/create-agent', auth, async (req, res) => {
  const { companyName, companyRules, agentName, agentGender, agentRegion, agentCustomVoiceId } = req.body;

  if (!companyName || !companyRules) {
    return res.status(400).json({ error: "Company Name and Rules are required!" });
  }

  try {
    // Strategic Plan Limits Check
    const user = await User.findById(req.user.id);
    const agentCount = user.agents ? user.agents.length : 0;
    
    if (user.plan === 'FREE' && agentCount >= 5) {
        return res.status(403).json({ error: "Free Plan allows only 5 Agents. Please upgrade to Pro." });
    }
    if (user.plan === 'PRO_PLATFORM' && agentCount >= 15) {
        return res.status(403).json({ error: "Pro Plan allows 15 Agents. Please upgrade to Enterprise." });
    }
    if (user.plan === 'ENTERPRISE' && agentCount >= 50) {
        return res.status(403).json({ error: "Enterprise Plan allows 50 Agents. Contact Support for higher limits." });
    }

    // 1. Dynamic Name & Region Logic
    let finalAgentName = agentName;
    
    if (!finalAgentName || finalAgentName.trim() === '') {
        if (agentRegion === 'indian') {
            const indianMales = ['Rahul', 'Vikram', 'Amit', 'Rohan'];
            const indianFemales = ['Priya', 'Neha', 'Anjali', 'Sneha'];
            if (agentGender === 'male') finalAgentName = indianMales[Math.floor(Math.random() * indianMales.length)];
            else if (agentGender === 'female') finalAgentName = indianFemales[Math.floor(Math.random() * indianFemales.length)];
            else {
                const allIndians = [...indianMales, ...indianFemales];
                finalAgentName = allIndians[Math.floor(Math.random() * allIndians.length)];
            }
        } else {
            const intlMales = ['John', 'Michael', 'David', 'James'];
            const intlFemales = ['Sarah', 'Emily', 'Jessica', 'Emma'];
            if (agentGender === 'male') finalAgentName = intlMales[Math.floor(Math.random() * intlMales.length)];
            else if (agentGender === 'female') finalAgentName = intlFemales[Math.floor(Math.random() * intlFemales.length)];
            else {
                const allIntl = [...intlMales, ...intlFemales];
                finalAgentName = allIntl[Math.floor(Math.random() * allIntl.length)];
            }
        }
    }

    // 2. Dynamic Voice & Prompt Selection based on Region
    let maleVoices = [];
    let femaleVoices = [];
    let languageInstruction = "";
    let greetingMessage = "";

    if (agentRegion === 'indian') {
        languageInstruction = "You are serving Indian customers. Speak in clear Hindi or Indian English (Hinglish) based on how the customer speaks. Use a warm, culturally appropriate tone.";
        maleVoices = ['arvind', 'amit']; 
        femaleVoices = ['kajal', 'priya'];
        greetingMessage = `Namaste! Welcome to ${companyName}. Mera naam ${finalAgentName} hai, main aapki kaise madad kar sakt${agentGender==='male'?'a':'i'} hu?`;
    } else {
        languageInstruction = "You are serving an International client base. Speak in clear, professional Global/US English strictly.";
        maleVoices = ['william', 'matt'];
        femaleVoices = ['jennifer', 'emma'];
        greetingMessage = `Hello, welcome to ${companyName}. I am ${finalAgentName}, how can I help you today?`;
    }

    let selectedVoiceId = femaleVoices[0]; // Default
    if (agentGender === 'custom' && agentCustomVoiceId) {
        selectedVoiceId = agentCustomVoiceId;
    } else if (agentGender === 'male') {
        selectedVoiceId = maleVoices[Math.floor(Math.random() * maleVoices.length)];
    } else if (agentGender === 'female') {
        selectedVoiceId = femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
    } else if (agentGender === 'random') {
        const allVoices = [...maleVoices, ...femaleVoices];
        selectedVoiceId = allVoices[Math.floor(Math.random() * allVoices.length)];
    }

    const payload = {
      name: `${finalAgentName} (for ${companyName})`,
      voice: {
        provider: "playht",
        voiceId: selectedVoiceId
      },
      model: {
        provider: "groq",
        model: "llama-3-8b-8192",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are ${finalAgentName}, the official customer service representative for "${companyName}".
            ${languageInstruction}
            
            COMPANY RULES AND KNOWLEDGE:
            ${companyRules}
            
            Always be polite, professional, and concise. Never say you are an AI.`
          }
        ]
      },
      firstMessage: greetingMessage
    };

    const vapiResponse = await axios.post(`${VAPI_BASE_URL}/assistant`, payload, {
      headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}` }
    });

    const newAgent = {
        assistantId: vapiResponse.data.id,
        name: `${companyName} Customer Care`,
        linkedNumber: "Unassigned"
    };
    await User.findByIdAndUpdate(req.user.id, { $push: { agents: newAgent } });

    res.status(200).json({
      message: "Agent created successfully!",
      assistantId: vapiResponse.data.id,
      details: vapiResponse.data
    });

  } catch (error) {
    console.error("Vapi Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create agent on Vapi Server." });
  }
});

// ---------------------------------------------------------
// 2. ENDPOINT: Assign Phone Number Logic (Option A & B)
// ---------------------------------------------------------
app.post('/api/saas/assign-number', async (req, res) => {
  const { assistantId, option } = req.body;
  
  try {
    if (option === 'BUY_NEW') {
      res.status(200).json({
        message: "New number purchased and linked!",
        assignedNumber: "+1-800-NEW-1234",
        status: "ACTIVE"
      });
    } else if (option === 'USE_EXISTING') {
      res.status(200).json({
        message: "Use Call Forwarding setup activated.",
        forwardToNumber: "+1-888-HIDDEN-999",
        instructions: "Please dial your carrier and setup call-forwarding to the above number."
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to assign number." });
  }
});

// ---------------------------------------------------------
// 3. ENDPOINT: Upload Knowledge Base (Document) to Vapi
// ---------------------------------------------------------
app.post('/api/saas/upload-kb', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    const vapiResponse = await axios.post(`${VAPI_BASE_URL}/file`, formData, {
      headers: { 
        ...formData.getHeaders(),
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}` 
      }
    });

    // Clean up local temp file
    if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }

    const newDoc = {
        fileName: req.file.originalname,
        url: vapiResponse.data.id
    };
    await User.findByIdAndUpdate(req.user.id, { $push: { knowledgeBase: newDoc } });

    res.status(200).json({
      message: "Knowledge base document uploaded successfully!",
      fileId: vapiResponse.data.id,
      details: vapiResponse.data
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("Vapi Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to upload document to Vapi Server." });
  }
});

// ---------------------------------------------------------
// 4. ENDPOINT: Vapi Tool Call Webhook (Bridge to n8n)
// ---------------------------------------------------------
app.post('/api/saas/vapi-webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log("Received Webhook from Vapi");

    if (payload.message && payload.message.type === 'tool-calls') {
      const toolCalls = payload.message.toolCalls;
      let results = [];
      
      for (const call of toolCalls) {
        console.log(`Executing tool: ${call.function.name}`);
        // TODO: Forward to the specific Company's n8n webhook based on DB info
        results.push({
            toolCallId: call.id,
            result: JSON.stringify({ success: true, message: "Action completed successfully via Voxiq Automation." })
        });
      }

      return res.status(200).json({ results });
    }

    res.status(200).send('Webhook Received');
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send('Webhook Processing Failed');
  }
});

// ---------------------------------------------------------
// 5. ENDPOINT: Admin Live Pitch Engine (Outbound Call)
// ---------------------------------------------------------
app.post('/api/vapi/demo-outbound', auth, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only Super Admins can use the Pitch Engine' });
        }

        const { prospectPhone, customPrompt } = req.body;
        if (!prospectPhone) {
            return res.status(400).json({ error: 'Prospect phone number is required' });
        }

        const payload = {
            customer: {
                number: prospectPhone
            },
            assistant: {
                name: "Voxiq Demo Agent",
                voice: {
                    provider: "playht",
                    voiceId: "arvind" // Professional male indian voice
                },
                model: {
                    provider: "groq",
                    model: "llama-3-8b-8192",
                    temperature: 0.7,
                    messages: [
                        {
                            role: "system",
                            content: customPrompt || "You are a highly professional sales representative for Voxiq. Explain how our AI voice agents can automate customer support and save costs. Be concise, polite, and conversational. Do not say you are an AI."
                        }
                    ]
                },
                firstMessage: "Hello, this is a live demo from the Voxiq AI system. How can I assist you today?"
            }
        };

        // Note: Vapi requires a phoneNumberId to make outbound calls.
        if (process.env.VAPI_CALL_PHONE_NUMBER_ID) {
             payload.phoneNumberId = process.env.VAPI_CALL_PHONE_NUMBER_ID;
        }

        const vapiResponse = await axios.post(`${VAPI_BASE_URL}/call`, payload, {
            headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}` }
        });

        // Deduct ₹5 from Admin Wallet
        const user = await User.findById(req.user.id);
        if (user && user.walletBalance >= 5) {
             user.walletBalance -= 5;
             await user.save();
        }

        res.json({ message: 'Live pitch call initiated successfully!', callId: vapiResponse.data.id });
    } catch (error) {
        console.error('Error triggering outbound demo:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to initiate call. To make outbound PSTN calls, ensure you have imported a Twilio/Vonage number inside your Vapi.ai Dashboard and added its ID to the .env file as VAPI_CALL_PHONE_NUMBER_ID.',
            details: error.response?.data?.message || error.message
        });
    }
});

// Database Connection
console.log('Attempting MongoDB Connection to:', process.env.MONGO_URI ? 'URI Found' : 'URI Missing');

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('✅ MongoDB Connected successfully.');
    
    app.listen(PORT, () => {
        console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Mongoose Failed to Connect:');
    console.error(err);
});
