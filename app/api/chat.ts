import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { messages } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-mini',
      messages,
      stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
