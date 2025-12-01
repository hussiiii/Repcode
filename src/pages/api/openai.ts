import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { question, solution, userSolution, userMessage, apiKey, mode = "chat" } = req.body;

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
      max_tokens: 1500, 
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
