import { z } from 'zod';
import OpenAI from 'openai';
import prisma from '../../../prisma_client';
import { ApiError } from '../../auth/Authenticate';
import { withUser } from '../../lib/server/api';

const requestSchema = z.object({
  question: z.string().max(100000),
  solution: z.string().max(100000),
  userSolution: z.string().max(100000),
  userMessage: z.string().max(10000),
  mode: z.enum(['chat', 'analyze']).default('chat'),
});

export default withUser('POST', async (req, res) => {
  const { question, solution, userSolution, userMessage, mode } = requestSchema.parse(req.body);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.appUser.id }, select: { apiKey: true },
  });
  if (!user.apiKey?.trim() || user.apiKey === 'null') {
    throw new ApiError(400, 'Please add your OpenAI API key in Settings first');
  }

  // Analyze mode only initializes the chat UI; it does not make a paid request.
  if (mode === 'analyze') return res.status(200).json({ message: 'Analysis complete' });

  try {
    const openai = new OpenAI({ apiKey: user.apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: "You are a helpful coding assistant. I am going to send you a programming problem, the expected solution, and the user's solution. The user needs help with their code.",
        },
        {
          role: 'user',
          content: `Problem: ${question}\nExpected Solution: ${solution}\nMy Solution: ${userSolution}\nWhat I need help with: ${userMessage}`,
        },
      ],
      max_tokens: 1500,
    });
    const message = completion.choices[0]?.message?.content?.trim();
    return res.status(200).json({ message: message || 'No response from AI.' });
  } catch {
    // Provider error messages can contain credential details; keep them server-side.
    throw new ApiError(502, 'AI request failed. Check your saved API key and try again.');
  }
});
