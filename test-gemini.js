const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    try {
        console.log("Testing with API Key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello world");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (e) {
        console.error("Error:", e.message);
        if (e.status) console.error("Status:", e.status);
    }
}
run();
