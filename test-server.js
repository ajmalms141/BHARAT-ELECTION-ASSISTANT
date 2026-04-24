const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const systemInstruction = "You are a bot.";
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: systemInstruction,
            generationConfig: { temperature: 0.2 }
        });
        const result = await model.generateContent("hello");
        const response = await result.response;
        console.log("SUCCESS:", response.text());
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
