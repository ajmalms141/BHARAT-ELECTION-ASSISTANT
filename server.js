const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080; // Cloud run defaults to 8080

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let genAI;
try {
   if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
       genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   }
} catch (e) {
    console.warn("GoogleGenerativeAI initialized without API key or there was an error. Make sure to set GEMINI_API_KEY in .env");
}

const systemInstruction = `You are an expert, helpful, and objective Election Assistant. 
Your goal is to educate users about the election process, voting timelines, and steps involved in participating in an election. 
You must follow these rules strictly:
1. ONLY answer questions related to elections, voting, political processes, and related civic duties.
2. If a user asks a question unrelated to elections (e.g., programming, cooking, general knowledge), politely decline to answer and remind them that your purpose is to discuss elections.
3. Keep your answers concise, clear, and easy to follow. Use formatting like bullet points when explaining steps.
4. Maintain a neutral, non-partisan tone. Do not express political opinions or endorse any candidates.`;

app.post('/api/chat', async (req, res) => {
    try {
        if (!genAI) {
             if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
                  return res.status(500).json({ error: "API Key not configured. Please add it to the .env file." });
             }
             genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            systemInstruction: systemInstruction,
            generationConfig: { temperature: 0.2 }
        });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to generate response. Please check server logs." });
    }
});

app.listen(port, () => {
    console.log(`Election Assistant Server running at http://localhost:${port}`);
});
