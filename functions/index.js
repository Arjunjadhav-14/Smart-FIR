const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

exports.chat = functions.https.onRequest(async (req, res) => {
  // CORS setup
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Missing or invalid messages parameter' });
      return;
    }

    // Secure API key extraction
    let apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || req.body.apiKey;
    
    // Check Authorization Header
    if (!apiKey && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      apiKey = req.headers.authorization.substring(7).trim();
    }

    if (!apiKey) {
      res.status(400).json({ error: 'No API Key configured on the server or provided by the client' });
      return;
    }

    // Required System Prompt
    const systemPrompt = `You are Smart FIR AI Assistant, a helpful legal guidance chatbot for Indian citizens. Reply only in the selected language. Ask one question at a time. Guide users through FIR filing. Do not claim FIR is officially filed. Do not ask for Aadhaar, OTP, passwords, or bank PIN.

Your role is to help users understand the FIR filing process in simple language.

You must:
- Ask only one question at a time
- Detect incident category automatically
- Collect:
  - Date
  - Time
  - Location
  - Description
  - Evidence
  - Contact details
- Suggest required evidence
- Explain FIR filing steps clearly
- Guide users calmly and professionally
- Generate FIR-ready summaries

Supported incidents:
- Theft / Robbery
- Cybercrime / Fraud
- Assault / Violence
- Harassment / Stalking
- Domestic Violence
- Other

In addition to your conversational response, when you believe you have gathered enough information to construct an FIR draft (or when the user explicitly requests to generate the draft), output a JSON block at the very end of your response inside a markdown code block labeled \`\`\`json-fir-draft ... \`\`\` containing the collected details structured as:
{
  "isReady": true,
  "category": "Theft / Robbery" | "Cybercrime / Fraud" | "Assault / Violence" | "Harassment / Stalking" | "Domestic Violence" | "Other",
  "date": "YYYY-MM-DDTHH:MM",
  "location": "Incident location details",
  "description": "A comprehensive summary of what happened, as described by the user",
  "complainantName": "Citizen's Name (if collected)",
  "complainantPhone": "Citizen's Phone (if collected)",
  "evidence": "Recommended evidence items"
}`;

    // Auto-detect API key type (Gemini starts with AIzaSy)
    const isGemini = apiKey.startsWith('AIzaSy');
    let aiMessage = '';

    if (isGemini) {
      // Clean history for Gemini API perfect alternation constraints
      const alternateMessages = [];
      messages.forEach(msg => {
        const role = msg.role === 'user' ? 'user' : 'model';
        const cleanText = msg.text.replace(/```json-fir-draft[\s\S]*?```/g, '').trim();
        if (!cleanText) return;

        if (alternateMessages.length > 0 && alternateMessages[alternateMessages.length - 1].role === role) {
          alternateMessages[alternateMessages.length - 1].parts[0].text += '\n' + cleanText;
        } else {
          alternateMessages.push({
            role: role,
            parts: [{ text: cleanText }]
          });
        }
      });

      // Execute Gemini model API request
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: alternateMessages,
        generationConfig: {
          temperature: 0.7
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.candidates && response.data.candidates[0].content && response.data.candidates[0].content.parts) {
        aiMessage = response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected Gemini API response structure');
      }

    } else {
      // Format messages for OpenAI
      const openAiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text.replace(/```json-fir-draft[\s\S]*?```/g, '').trim()
        }))
      ];

      // Execute OpenAI API request
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: openAiMessages,
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.data && response.data.choices && response.data.choices[0].message) {
        aiMessage = response.data.choices[0].message.content;
      } else {
        throw new Error('Unexpected OpenAI API response structure');
      }
    }

    res.status(200).json({ reply: aiMessage });
  } catch (error) {
    const errorDetails = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
    console.error('Error in chat Cloud Function:', errorDetails);
    res.status(500).json({ error: 'Internal server error', details: errorDetails });
  }
});
