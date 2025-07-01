// chat-flow.ts
import 'dotenv/config';
// import { curateOutfitFlow } from '@/ai/flows/curate-outfit';
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface ChatInput {
  userInput: string;
  history?: ChatMessage[];
}

export interface ChatOutput {
  aiResponse: string;
}

 function buildMessages(input: ChatInput) {
  const messages = input.history?.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  })) || [];

  messages.push({
    role: 'user',
    content: input.userInput,
  });

  return messages;
}

 function extractResponse(data: any): ChatOutput {
  return {
    aiResponse: data.choices?.[0]?.message?.content || "Sorry, I didn't catch that.",
  };
}

export async function chatFlow(input: ChatInput): Promise<ChatOutput> {
 // const apikey = process.env.OPENROUTER_API_KEY;
  //if (!apikey) {
   /* throw new Error("OPENROUTER_API_KEY is not set");
  }*/
  const SYSTEM_INSTRUCTION = `You are AestheFit Assistant, a friendly and knowledgeable personal stylist. 
  You provide concise, trendy, and personalized fashion advice based on the user's input. 
  Be encouraging, clear, and avoid long paragraphs.`;



  const messages = [
    {
      role: 'system',
      content: SYSTEM_INSTRUCTION,
    },
    ...buildMessages(input),
  ]
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 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",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error: ${error}`);
  }

  const data = await response.json();
  return extractResponse(data);
}