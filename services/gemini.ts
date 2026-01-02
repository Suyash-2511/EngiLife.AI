
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
    
    // Updated to gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    const safeJson = Array.isArray(json) ? json : [];
    return safeJson.map((item: any) => ({ ...item, status: 'upcoming' }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const explainConcept = async (query: string, branch: string, mode: 'simple' | 'socratic' = 'simple', imageBase64?: string): Promise<string> => {
  try {
    let systemInstruction = '';
    
    if (mode === 'socratic') {
      systemInstruction = `
        Act as a Socratic tutor for ${branch} engineering. 
        Rules:
        1. Do NOT give the direct answer or definition immediately.
        2. Ask a thought-provoking, guiding question to help the student derive the answer themselves.
        3. Break down complex concepts into smaller, logical steps.
        4. If the student's previous input suggests confusion, provide a small hint before asking the next question.
      `;
    } else {
      systemInstruction = `
        You are an expert engineering tutor specialized in ${branch}.
        Explain the concept clearly. Use Markdown (bold, lists, code blocks).
        If it involves math, write the formula clearly using standard text/unicode or LaTeX-like syntax.
        If an image is provided, analyze the diagram, circuit, or problem shown in detail.
      `;
    }

    const parts: any[] = [{ text: query }];
    
    if (imageBase64) {
      // Remove data URL prefix if present for the API call
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      });
    }

    // Updated to gemini-3-pro-preview for complex reasoning and STEM tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: systemInstruction
      }
    });
    return response.text || "No explanation found.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to get explanation. Please try again.";
  }
};

export const generateLabManual = async (experimentName: string, branch: string, requirements?: string): Promise<string> => {
  try {
    const prompt = `
      Generate a structured lab manual for an engineering experiment.
      Branch: ${branch}
      Experiment: "${experimentName}"
      ${requirements ? `Specific Requirements/Constraints: "${requirements}"` : ''}
      
      Structure required (Use Markdown H2 for headers):
      1. **Objective**
      2. **Apparatus/Tools Required**
      3. **Theory** (Brief, include formula if needed)
      4. **Procedure** (Step-by-step numbered list)
      5. **Observation Table** (Create a markdown table template)
      6. **Result**
      
      Format as clean Markdown.
    `;

    // Updated to gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate manual.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate lab manual.";
  }
};

export const generateVivaQuestions = async (experimentName: string, branch: string, requirements?: string): Promise<any[]> => {
  try {
    const prompt = `
      Generate 5 viva voce questions and answers for the experiment: "${experimentName}" (${branch}).
      ${requirements ? `Take into account these requirements: "${requirements}".` : ''}
      Return JSON: [{ "question": string, "answer": string }]
    `;

    // Updated to gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

export const generateCodeSnippet = async (experimentName: string, requirements?: string): Promise<string> => {
    try {
        const prompt = `
          Write the code implementation for "${experimentName}". 
          ${requirements ? `Follow these specific requirements: "${requirements}".` : ''}
          If no requirements specified:
          - If it's a CS experiment, provide C++/Python/Java code.
          - If it's Electronics, provide Verilog/MATLAB/Arduino code if applicable.
          
          Wrap in markdown code block.
        `;
        // Updated to gemini-3-pro-preview for coding and complex tasks
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
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

    // Updated to gemini-3-pro-preview for complex reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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

export const generateJobMatches = async (role: string, skills: string[]): Promise<any[]> => {
  try {
    const prompt = `
      Generate 3 realistic job opportunity listings for a "${role}" role suited for a student with these skills: ${skills.join(', ')}.
      Return JSON: [{ "role": string, "company": string, "match": number, "skills": string[] }]
      match should be a number between 60 and 99.
    `;
    
    // Updated to gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              match: { type: Type.INTEGER },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } }
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

export const generateResumeTips = async (skills: string[], experience: string): Promise<string> => {
  // Keeping for backward compatibility or simpler calls
  return "Deprecated: Use analyzeResume";
};

export const generateInterviewQuestion = async (role: string, focus: string = 'General', context?: string): Promise<string> => {
  try {
    const prompt = `
      You are a professional technical interviewer for a ${role} position.
      Interview Focus: ${focus}.
      ${context ? `Conversation Context: ${context}` : ''}
      
      Ask ONE relevant, challenging question suitable for an engineering graduate.
      - If focus is "Behavioral", ask about soft skills, conflict resolution, or past projects.
      - If focus is "Technical", ask a specific concept or problem related to the role.
      - Keep it professional and direct. Do NOT provide the answer.
    `;
    // Updated to gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
      
      1. Provide brief, constructive feedback (what was good, what to improve).
      2. Rate the answer out of 10.
      3. Generate the Next Question to continue the flow.
      
      Return JSON format: { "feedback": string, "rating": number, "nextQuestion": string }
    `;

    // Updated to gemini-3-pro-preview for complex reasoning and evaluation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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

export const generateInterviewReport = async (history: any[]): Promise<any> => {
  try {
    const transcript = history.map(h => `${h.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${h.text}`).join('\n');
    const prompt = `
      Analyze the following mock interview transcript for an engineering role.
      
      TRANSCRIPT:
      ${transcript}
      
      Provide a structured evaluation:
      1. Overall Score (0-100).
      2. Technical Accuracy (0-100).
      3. Communication Skills (0-100).
      4. Key Strengths (array of strings).
      5. Areas for Improvement (array of strings).
      6. Final Verdict (Hire, No Hire, Strong Hire, Leaning Hire).
      7. A brief executive summary (max 50 words).

      Return JSON.
    `;

    // Updated to gemini-3-pro-preview for complex text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            technicalScore: { type: Type.INTEGER },
            communicationScore: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            verdict: { type: Type.STRING },
            summary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const generateCareerRoadmap = async (role: string): Promise<any[]> => {
  try {
    const prompt = `
      Create a 5-step learning roadmap for an engineering student wanting to become a "${role}".
      For each step, provide a title, duration, and key topics.
      Return JSON: [{ "step": number, "title": string, "duration": string, "topics": string }]
    `;
    
    // Updated to gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

export const analyzeSkillGap = async (currentSkills: string[], targetRole: string, jobDescription?: string): Promise<any> => {
  try {
    const prompt = `
      Act as an AI Career Coach.
      Analyze the candidate's current skills: "${currentSkills.join(', ')}".
      Target Role: "${targetRole}".
      ${jobDescription ? `Job Description: "${jobDescription}"` : ''}

      1. Calculate a match score (0-100).
      2. Identify missing critical skills categorized by priority.
      3. Provide a brief analysis of the gap.

      Return JSON: { 
        "matchScore": number, 
        "missingSkills": [{ "skill": string, "priority": "High" | "Medium", "reason": string }], 
        "analysis": string 
      }
    `;

    // Updated to gemini-3-pro-preview for complex reasoning task
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER },
            missingSkills: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: {
                  skill: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["High", "Medium"] },
                  reason: { type: Type.STRING }
                }
              }
            },
            analysis: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error(error);
    return { matchScore: 50, missingSkills: [{ skill: "Advanced Tech", priority: "High", reason: "Required for role" }], analysis: "Unable to analyze at this moment." };
  }
};

export const generatePersonalizedLearningPath = async (missingSkills: string[], role: string): Promise<any> => {
  try {
    const prompt = `
      Create a 4-week intensive learning path to help an engineering student acquire these missing skills: "${missingSkills.join(', ')}".
      Target Role: ${role}.

      Structure it week by week. 
      Also suggest a final capstone project.

      Return JSON: { 
        "weeks": [{ "week": number, "theme": string, "topics": string[], "practice": string }], 
        "project": { "title": string, "description": string } 
      }
    `;

    // Updated to gemini-3-flash-preview for structured text generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  practice: { type: Type.STRING }
                }
              }
            },
            project: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error(error);
    return {};
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

    // Updated to gemini-3-flash-preview for content extraction
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
