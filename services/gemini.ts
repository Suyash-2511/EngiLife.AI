import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyPlan = async (subjects: string[], pendingTasks: string[], hoursAvailable: number): Promise<any[]> => {
  try {
    const prompt = `
      Create a realistic daily schedule for an engineering student.
      Current Subjects: ${subjects.join(', ')}.
      Pending Tasks: ${pendingTasks.join(', ')}.
      Available Hours: ${hoursAvailable}.
      
      Generate a list of 5-7 schedule items. Mix lectures, study sessions for the pending tasks, and breaks.
      Ensure the timeline is sequential starting from 09:00.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Time in 24h format e.g. 09:00" },
              activity: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['Lecture', 'Study', 'Break', 'Lab'] },
              location: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "[]");
    return json.map((item: any) => ({ ...item, status: 'upcoming' }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const explainConcept = async (query: string, branch: string, mode: 'simple' | 'socratic' = 'simple'): Promise<string> => {
  try {
    let prompt = '';
    if (mode === 'socratic') {
      prompt = `
        Act as a Socratic tutor for ${branch} engineering. 
        The student asks: "${query}".
        
        Rules:
        1. Do NOT give the direct answer or definition immediately.
        2. Ask a thought-provoking, guiding question to help the student derive the answer themselves.
        3. Break down complex concepts into smaller, logical steps.
        4. If the student's previous input suggests confusion, provide a small hint before asking the next question.
        5. Keep responses concise, conversational, and encouraging.
      `;
    } else {
      prompt = `
        You are an expert engineering tutor specialized in ${branch}.
        Explain the following concept clearly, using analogies where appropriate.
        Use Markdown formatting (bolding, lists, code blocks) to make it readable.
        If it involves math, write the formula clearly.
        Concept: "${query}"
        Keep it concise but comprehensive (under 300 words).
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No explanation found.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to get explanation.";
  }
};

export const generateLabManual = async (experimentName: string, branch: string): Promise<string> => {
  try {
    const prompt = `
      Generate a structured lab manual for an engineering experiment.
      Branch: ${branch}
      Experiment: "${experimentName}"
      
      Structure required (Use Markdown H2 for headers):
      1. **Objective**
      2. **Apparatus/Tools Required**
      3. **Theory** (Brief, include formula if needed)
      4. **Procedure** (Step-by-step numbered list)
      5. **Observation Table** (Create a markdown table template)
      6. **Result**
      
      Format as clean Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate manual.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate lab manual.";
  }
};

export const generateVivaQuestions = async (experimentName: string, branch: string): Promise<any[]> => {
  try {
    const prompt = `
      Generate 5 viva voce questions and answers for the experiment: "${experimentName}" (${branch}).
      Return JSON: [{ "question": string, "answer": string }]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
           type: Type.ARRAY,
           items: {
             type: Type.OBJECT,
             properties: {
               question: { type: Type.STRING },
               answer: { type: Type.STRING }
             }
           }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const generateCodeSnippet = async (experimentName: string): Promise<string> => {
    try {
        const prompt = `
          Write the code implementation for "${experimentName}". 
          If it's a CS experiment, provide C++/Python/Java code.
          If it's Electronics, provide Verilog/MATLAB/Arduino code if applicable.
          Wrap in markdown code block.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
}

export const analyzeResume = async (skills: string[], experience: string): Promise<{score: number, feedback: string[], keywords: string[]}> => {
  try {
    const prompt = `
      Analyze this engineering student resume profile.
      Skills: ${skills.join(', ')}
      Experience: ${experience}
      
      1. Give an ATS Score out of 100 based on keyword density and impact.
      2. Provide 3 specific improvements.
      3. List 5 missing keywords relevant to the likely role.
      
      Return JSON: { "score": number, "feedback": string[], "keywords": string[] }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { score: 70, feedback: ["Add more numbers"], keywords: ["Teamwork"] };
  }
};

export const generateResumeTips = async (skills: string[], experience: string): Promise<string> => {
  // Keeping for backward compatibility or simpler calls
  return "Deprecated: Use analyzeResume";
};

export const generateInterviewQuestion = async (role: string, context?: string): Promise<string> => {
  try {
    const prompt = `
      You are a technical interviewer for a ${role} position.
      ${context ? `Previous context: ${context}` : ''}
      Ask a relevant behavioral or technical question suitable for a fresh engineering graduate.
      Just ask the question, do not provide the answer.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Tell me about yourself.";
  } catch (error) {
    return "Describe a challenging project you worked on.";
  }
};

export const evaluateInterviewAnswer = async (question: string, answer: string): Promise<{feedback: string, rating: number, nextQuestion: string}> => {
  try {
    const prompt = `
      I am an engineering student in a mock interview.
      Question: "${question}"
      My Answer: "${answer}"
      
      1. Provide brief feedback (what was good, what to improve).
      2. Rate the answer out of 10.
      3. Ask a follow-up question or a new question.
      
      Return JSON format: { "feedback": string, "rating": number, "nextQuestion": string }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             feedback: { type: Type.STRING },
             rating: { type: Type.NUMBER },
             nextQuestion: { type: Type.STRING }
           }
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { feedback: "Good effort.", rating: 5, nextQuestion: "Do you have any other skills?" };
  }
};

export const generateCareerRoadmap = async (role: string): Promise<any[]> => {
  try {
    const prompt = `
      Create a 5-step learning roadmap for an engineering student wanting to become a "${role}".
      For each step, provide a title, duration, and key topics.
      Return JSON: [{ "step": number, "title": string, "duration": string, "topics": string }]
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
               step: { type: Type.INTEGER },
               title: { type: Type.STRING },
               duration: { type: Type.STRING },
               topics: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const generateFlashcardsFromNotes = async (notes: string): Promise<any[]> => {
  try {
    const prompt = `
      Analyze the following study notes and generate 5 high-quality flashcards for Active Recall.
      Focus on definitions, formulas, or key engineering concepts found in the text.
      
      Notes: "${notes.substring(0, 3000)}"
      
      Return JSON: [{ "question": string, "answer": string }]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};