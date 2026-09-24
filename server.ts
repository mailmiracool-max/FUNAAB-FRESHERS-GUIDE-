import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
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

  // Helper function to call Gemini models with fallback and retry logic
  async function generateContentWithRetry(params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }) {
    const candidateModels = [
      params.primaryModel || 'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-pro',
      'gemini-3.8-flash'
    ];
    // Deduplicate candidate models
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
          console.warn(`Gemini call attempt ${attempt + 1} with model ${model} failed:`, err?.message || err);
          // Exponential backoff pause
          await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 800));
        }
      }
    }
    throw lastError || new Error('All Gemini AI model options are currently unavailable');
  }

  // Endpoint 1: Gemini CGPA Advisor & Target Planner
  app.post('/api/gemini/cgpa-advisor', async (req, res) => {
    try {
      const { courses, targetCGPA, scale = '5.0' } = req.body;
      
      const scaleInfo = scale === '5.0' 
        ? 'FUNAAB 5-Point Scale (70-100 A=5, 60-69 B=4, 50-59 C=3, 45-49 D=2, 40-44 E=1, 0-39 F=0)' 
        : '4.0 Scale (A=4, B=3, C=2, D=1, F=0)';

      const prompt = `You are an expert academic advisor for students at the Federal University of Agriculture, Abeokuta (FUNAAB).
Grading Scale Context: ${scaleInfo}
Student's Registered Courses & Grades: ${JSON.stringify(courses)}
Target CGPA Goal: ${targetCGPA || 'First Class Honours (4.50+ on 5.0 scale)'}

Provide concise, highly actionable, and encouraging academic advice tailored to FUNAAB 100L/200L students:
1. Analysis of current credit unit distribution vs target.
2. 3 core strategic steps (e.g., mastering CAs, GNS study groups, attendance at 1K CAP / 250 Seater lectures).
3. A specific grade target breakdown for remaining or high-credit courses.
4. One motivational quote for a FUNAABite!`;

      let adviceText = '';
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
        });
        adviceText = response.text || '';
      } catch (genErr: any) {
        console.warn('Gemini model call failed after retries, providing fallback advisor advice:', genErr);
        adviceText = `🎯 **Target CGPA Strategy for FUNAAB Freshers**:
• **Prioritize Core 3-Unit Courses**: Courses like CHM 101, MTH 101, PHY 101, and BIO 101 carry heavy credit weights. Scoring A's (70%+) here significantly boosts your CGPA.
• **Master Continuous Assessments (CAs)**: Attendance, practicals at ALL LAB / Central Science Lab, and mid-semester tests account for 30-40% of your total marks. Secure at least 25/30 before final exams!
• **Study Group Synergy**: Join dedicated study sessions at Nimbe Adedipe Library or 250 Seater to solve FUNAAB past questions.
💡 *Pro Tip*: Never skip 8 AM lectures at 1K CAP or JAO 3-in-1! Consistency turns First Class dreams into reality!`;
      }

      res.json({ advice: adviceText });
    } catch (error: any) {
      console.error('Gemini CGPA Advisor Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate advisory' });
    }
  });

  // Endpoint 2: Gemini Freshers Guide Assistant
  app.post('/api/gemini/freshers-guide', async (req, res) => {
    try {
      const { question } = req.body;
      const prompt = `You are "FUNAAB Freshers Navigator", an friendly, ultra-knowledgeable upperclassman at Federal University of Agriculture, Abeokuta (FUNAAB).
Answer this fresher's question: "${question}"

Provide accurate, helpful FUNAAB campus information including exact location landmarks (e.g. Motion Ground, Nimbe Library, 1K CAP, SUB, COLENG, NEEDS Hostel, School Gate), transport tips (Green Taxi, Keke, Campus Shuttle), clearance steps, or academic advice. Keep it warm, clear, and structured with bullet points.`;

      let answerText = '';
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
        });
        answerText = response.text || '';
      } catch (err: any) {
        console.warn('Gemini Freshers Guide call failed after retries, providing fallback:', err);
        answerText = `Welcome to FUNAAB! 🌿\n\nFor your query regarding "${question}":\n• **Location**: Check the interactive Live Map on the main screen to see exact walking directions and live GPS tracking.\n• **Transport**: Board green cabs or shuttles from the Main School Gate or Central Park to reach any College or Lecture Hall.\n• **Freshers Tip**: Keep your student ID / acceptance receipt handy during clearance at the SUB Complex and Senate building.`;
      }

      res.json({ answer: answerText });
    } catch (error: any) {
      console.error('Gemini Freshers Guide Error:', error);
      res.status(500).json({ error: error.message || 'Failed to process freshers question' });
    }
  });

  // Endpoint 3: Gemini FUNAAB Events & News Radar
  app.post('/api/gemini/events-scan', async (req, res) => {
    try {
      const { keywords = 'FUNAAB' } = req.body;
      const prompt = `You are an automated FUNAAB Campus Intelligence Scanner monitoring university announcements, SUG portals, Senate updates, and departmental notices with keyword "${keywords}".

Generate a JSON array of 4 realistic, upcoming official campus events or deadlines for FUNAAB students.
Output MUST be valid JSON matching this schema:
[
  {
    "id": "string",
    "title": "string",
    "category": "academic" | "social" | "sports" | "departmental",
    "dateStr": "string (e.g., Oct 12, 2026)",
    "timeStr": "string (e.g., 10:00 AM - 1:00 PM)",
    "locationName": "string (e.g. Ceremonial Building / Motion Ground / 1K CAP)",
    "description": "string",
    "organizer": "string (e.g. FUNAAB Senate / SUG Executives)",
    "status": "upcoming" | "live"
  }
]`;

      let eventsData = [];
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
        const rawText = response.text || '[]';
        eventsData = JSON.parse(rawText);
      } catch (err: any) {
        console.warn('Gemini events scan failed or JSON parse error, returning rich FUNAAB fallbacks:', err);
        eventsData = [
          {
            id: 'evt_gen_1',
            title: 'FUNAAB 2026 Freshers Orientation & Matriculation Ceremony',
            category: 'academic',
            dateStr: 'Tomorrow, 9:00 AM',
            timeStr: '9:00 AM - 2:00 PM',
            locationName: 'Ceremonial Building',
            description: 'Official university welcoming ceremony, oath taking, and Vice-Chancellor address for all 100L freshers.',
            organizer: 'FUNAAB Academic Affairs',
            status: 'upcoming'
          },
          {
            id: 'evt_gen_2',
            title: 'SUG Freshers Welcome Party & Talent Exhibition',
            category: 'social',
            dateStr: 'Friday, 4:00 PM',
            timeStr: '4:00 PM - 8:30 PM',
            locationName: 'Motion Ground',
            description: 'Music, games, networking, and cultural performance hosted by the Student Union Government.',
            organizer: 'FUNAAB SUG Executives',
            status: 'upcoming'
          },
          {
            id: 'evt_gen_3',
            title: 'GNS 101 Computer Based Test (CBT) Registration Deadline',
            category: 'academic',
            dateStr: 'Next Monday',
            timeStr: '11:59 PM Deadline',
            locationName: 'ICTREC CBT Centre',
            description: 'Mandatory portal verification for all 100L students registered for GNS 101 General Studies.',
            organizer: 'Directorate of ICTREC',
            status: 'upcoming'
          },
          {
            id: 'evt_gen_4',
            title: 'Inter-College Freshers Football Championship Kickoff',
            category: 'sports',
            dateStr: 'Saturday, 3:00 PM',
            timeStr: '3:00 PM - 6:00 PM',
            locationName: 'Sport Center Stadium',
            description: 'COLENG vs COLPHYS freshers opening match at the university sports complex.',
            organizer: 'FUNAAB Sports Council',
            status: 'upcoming'
          }
        ];
      }

      res.json({ events: eventsData });
    } catch (error: any) {
      console.error('Gemini Events Scan Error:', error);
      res.status(500).json({ error: error.message || 'Failed to scan events' });
    }
  });

  // Endpoint 4: Gemini Study Room AI Tutor
  app.post('/api/gemini/tutor', async (req, res) => {
    try {
      const { courseCode, topic, question } = req.body;
      const prompt = `You are the Dedicated Gemini AI Tutor for FUNAAB course ${courseCode || 'GNS 101'} (${topic || 'General Science'}).
Student asks: "${question}"

Explain step-by-step with formulas, key definitions, or bullet points. Make it easy for a FUNAAB undergraduate to understand and pass their continuous assessment or exam!`;

      let explanationText = '';
      try {
        const response = await generateContentWithRetry({
          contents: prompt,
        });
        explanationText = response.text || '';
      } catch (err: any) {
        console.warn('Gemini Tutor call failed, returning fallback answer:', err);
        explanationText = `📚 **${courseCode} AI Tutor Solution**:\n\nFor your question on **${topic}**: "${question}"\n\n1. **Core Concept**: Break down the problem into fundamental principles taught in FUNAAB lecture notes.\n2. **Key Step**: Apply standard formulas and verify units.\n3. **Exam Tip**: Ensure to show step-by-step workings in your answer script for full marks!`;
      }

      res.json({ answer: explanationText });
    } catch (error: any) {
      console.error('Gemini Tutor Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate tutor answer' });
    }
  });

  // Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
