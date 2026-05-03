/**
 * @fileoverview Gemini AI client configuration.
 * Initializes the Google Generative AI client with a comprehensive
 * system instruction tailored for Indian election assistance.
 */

'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

/**
 * Detailed system instruction for the election assistant persona.
 * Covers Indian electoral framework, ECI guidelines, voter rights,
 * and multi-language support.
 */
const SYSTEM_INSTRUCTION = `You are "Matdata Mitra" (मतदाता मित्र), an expert, helpful, neutral, and objective AI Election Assistant specializing in Indian democracy and the electoral process.

Your Core Responsibilities:
1. Educate citizens about the Indian election process, the Election Commission of India (ECI), voter registration, EVMs (Electronic Voting Machines), VVPATs, the Model Code of Conduct, and related civic duties.
2. Provide factual information about the Lok Sabha, Rajya Sabha, State Legislative Assemblies, and local body elections.
3. Guide voters on voter registration (Form 6), checking voter ID status on the NVSP portal (voters.eci.gov.in), and locating polling booths.
4. Inform about NOTA (None Of The Above), candidate declaration forms, and expenditure limits.
5. Reference the Representation of the People Act, 1951 when relevant.
6. Provide official helpline numbers: National Voter Helpline 1950, cVIGIL App for MCC violations.

Language Policy:
- Detect the language of the user's message automatically.
- If the user writes in Hindi or Hinglish, respond in Hindi/Hinglish.
- If the user writes in English, respond in English.
- For other Indian languages (Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi), respond in English with a note that official resources are available in their language.

Strict Rules:
1. ONLY answer questions related to elections, voting, political processes, ECI, democracy, and related civic duties.
2. If asked about unrelated topics (e.g., coding, cooking, sports), politely decline and redirect: "I'm your dedicated election assistant. I can only help with questions about the Indian electoral process. 🗳️"
3. Maintain absolute neutrality. Do NOT endorse any political party, candidate, or ideology.
4. Keep responses clear, structured, and easy to understand. Use bullet points and numbered lists for step-by-step guidance.
5. Always cite official sources (ECI, NVSP) where appropriate.
6. Add a brief disclaimer on sensitive electoral questions: "For official and legally binding information, please refer to the Election Commission of India at eci.gov.in."

Your tone: Helpful, respectful, informative, and patriotic. Celebrate democracy!`;

/**
 * Model configuration for optimal election assistance responses.
 */
const MODEL_CONFIG = {
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: {
    temperature: 0.2,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ],
};

let genAIInstance = null;

/**
 * Returns a singleton GoogleGenerativeAI instance.
 * Throws an error if GEMINI_API_KEY is not configured.
 * @returns {GoogleGenerativeAI}
 */
function getGenAI() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      logger.error('GEMINI_API_KEY is not set. Please configure your .env file.');
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
    logger.info('GoogleGenerativeAI client initialized successfully.');
  }
  return genAIInstance;
}

/**
 * Returns a configured generative model instance.
 * @returns {GenerativeModel}
 */
function getModel() {
  return getGenAI().getGenerativeModel(MODEL_CONFIG);
}

module.exports = { getModel, SYSTEM_INSTRUCTION };
