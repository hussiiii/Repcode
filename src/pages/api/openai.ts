import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { question, solution, userSolution, userMessage, apiKey, mode = "chat", language, editorContent } = req.body;

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  let messages: any = [];
  
  if (mode === "analyze") {
    // Just load the context without asking a specific question
    messages = [
      { 
        role: "system", 
        content: "You are a helpful coding assistant. The user is working on a programming problem. I'm going to send you their code so you'll be ready to help when they ask questions." 
      },
      { 
        role: "user", 
        content: `Problem: ${question}\nExpected Solution: ${solution}\nUser's Current Code: ${userSolution}\n\nPlease prepare to help with this code. No response needed right now.` 
      }
    ];
  } else if (mode === "generate") {
    // Generate a solution for the problem
    messages = [
      {
        role: "system",
        content: "You are an expert coding assistant. The user is working on a programming problem and needs you to generate a complete solution with clear explanations. If provided, use the code template as a starting point and follow its structure, class names, and method signatures. Format your response using proper markdown with headings, code blocks, and explanations. The response should consist of only 3 headings - Code, Code Breakdown and Edge cases. No filler texts or texts that do not match these headings must be used. Maintain a formal tone and keep it simple."
      },
      {
        role: "user",
        content: `Problem: ${question}\n\n${editorContent ? `Code Template:\n\`\`\`${language}\n${editorContent}\n\`\`\`\n\n` : ''}Please generate a complete solution in ${language} programming language with detailed comments explaining the approach and key steps. ${editorContent ? 'Use the provided code template as a starting point if appropriate.' : ''} Use markdown formatting with:\n- A heading for the solution title\n- Code blocks using triple backticks and language specifier (e.g. \`\`\`${language})\n- Clear step-by-step explanations before and after code segments`
      }
    ];
  } else {
    // Normal chat mode with a user question
    messages = [
      { 
        role: "system", 
        content: "You are a helpful coding assistant. I am going to send you a programming problem, the expected solution, and the user's solution. The user needs help with their code." 
      },
      { 
        role: "user", 
        content: `Problem: ${question}\nExpected Solution: ${solution}\nMy Solution: ${userSolution}\nWhat I need help with: ${userMessage}` 
      }
    ];
  }

  try {
    if (mode === "analyze") {
      // Just return success for analyze mode without calling OpenAI
      // This saves tokens since we don't need a response yet
      res.status(200).json({ message: "Analysis complete" });
      return;
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: mode === "generate" ? 1500 : 300, // Increase token limit for solution generation
    });

    if (completion.choices && completion.choices.length > 0) {
      const message = completion.choices[0].message?.content?.trim() || "No response from AI.";
      res.status(200).json({ message });
    } else {
      res.status(500).json({ error: "No choices returned from AI." });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error communicating with OpenAI:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "Unknown error" });
    }
  }
};
