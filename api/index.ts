import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  primaryModel?: string;
}) {
  const candidateModels = [
    params.primaryModel || 'gemini-3.6-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  const models = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 800));
      }
    }
  }
  throw lastError || new Error('All Gemini AI model options are currently unavailable');
}

// Endpoint 1: Gemini CGPA Advisor & Target Planner
app.post('/api/gemini/cgpa-advisor', async (req, res) => {
  try {
    const { courses, targetCGPA, scale } = req.body;
    const prompt = `You are an Academic Advisor for Federal University of Agriculture, Abeokuta (FUNAAB).
Analyze student's current performance:
- Target CGPA Goal: ${targetCGPA || '4.50+ First Class'} (Scale: ${scale || '5.0'})
- Courses and Grades: ${JSON.stringify(courses || [])}

Provide an encouraging, highly practical study strategy for FUNAAB Freshers...`;

    let adviceText = '';
    try {
      const response = await generateContentWithRetry({ contents: prompt });
      adviceText = response.text || '';
    } catch (genErr) {
      adviceText = `🎯 **Target CGPA Strategy for FUNAAB Freshers**:\n• **Prioritize Core 3-Unit Courses**: Courses like CHM 101, MTH 101, PHY 101, and BIO 101 carry heavy credit weights. Scoring A's (70%+) here significantly boosts your CGPA.\n• **Master Continuous Assessments (CAs)**: Attendance, practicals at ALL LAB / Central Science Lab, and mid-semester tests account for 30-40% of your total marks.`;
    }

    res.json({ advice: adviceText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate advice' });
  }
});

// Endpoint 2: Freshers Guide Q&A Assistant
app.post('/api/gemini/freshers-guide', async (req, res) => {
  try {
    const { question } = req.body;
    const prompt = `You are "Gemini Freshers AI Advisor", an expert orientation assistant for FUNAAB Freshers.
Student asks: "${question}"
Answer clearly with bullet points and friendly tips.`;

    let answerText = '';
    try {
      const response = await generateContentWithRetry({ contents: prompt });
      answerText = response.text || '';
    } catch (err) {
      answerText = `Welcome to FUNAAB! 🌿\n\nFor your query regarding "${question}":\n• **Location**: Check the interactive Live Map on the main screen to see exact walking directions and live GPS tracking.\n• **Transport**: Board green cabs or shuttles from the Main School Gate or Central Park to reach any College or Lecture Hall.\n• **Freshers Tip**: Keep your student ID / acceptance receipt handy during clearance at the SUB Complex and Senate building.`;
    }

    res.json({ answer: answerText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// Endpoint 3: Gemini Events Scan
app.post('/api/gemini/events-crawler', async (req, res) => {
  try {
    const { keyword } = req.body;
    const prompt = `Act as FUNAAB Campus Event Crawler AI. Generate 3 realistic campus events related to ${keyword || 'FUNAAB'}. Return JSON array.`;

    let eventsData = [];
    try {
      const response = await generateContentWithRetry({
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      eventsData = JSON.parse(response.text || '[]');
    } catch (e) {
      eventsData = [{
        id: 'evt_gen_1',
        title: 'FUNAAB Freshers Welcome Symposium',
        category: 'seminar',
        dateStr: 'Tomorrow',
        timeStr: '10:00 AM - 01:00 PM',
        locationName: '1,000 Capacity Lecture Theatre (1K CAP)',
        description: 'University Orientation & Academic Excellence Seminar.',
        organizer: 'FUNAAB Directorate of Student Affairs',
        status: 'upcoming'
      }];
    }

    res.json({ events: eventsData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to scan events' });
  }
});

// Endpoint 4: Gemini AI Tutor
app.post('/api/gemini/tutor', async (req, res) => {
  try {
    const { courseCode, topic, question } = req.body;
    const prompt = `You are the Dedicated Gemini AI Tutor for FUNAAB course ${courseCode || 'GNS 101'} (${topic || 'General Science'}).
Student asks: "${question}"
Explain step-by-step with formulas, definitions, or bullet points.`;

    let explanationText = '';
    try {
      const response = await generateContentWithRetry({ contents: prompt });
      explanationText = response.text || '';
    } catch (err) {
      explanationText = `📚 **${courseCode} AI Tutor Solution**:\n\nFor question on **${topic}**: "${question}"\n\n1. Break down problem into core principles.\n2. Apply standard formulas and verify units.`;
    }

    res.json({ answer: explanationText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate tutor answer' });
  }
});

export default app;
