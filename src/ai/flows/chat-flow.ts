
'use server';
/**
 * @fileOverview AI Chatbot flow.
 *
 * - chatWithBot - A function that handles chatbot conversations.
 * - ChatInput - The input type for the chatWithBot function.
 * - ChatOutput - The return type for the chatWithBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { MessageData } from 'genkit';

// Schema for individual messages in the history from the client's perspective
const ChatMessageSchema = z.object({
  sender: z.enum(['user', 'ai']).describe("The sender of the message, either 'user' or 'ai'."),
  text: z.string().describe("The content of the message.")
});

const ChatInputSchema = z.object({
  userInput: z.string().describe("The latest message from the user."),
  history: z.array(ChatMessageSchema).optional().describe("The conversation history."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI's response to the user's message."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithBot(input: ChatInput): Promise<ChatOutput> {
  return chatWithBotFlow(input);
}

const SYSTEM_INSTRUCTION = "You are AestheFit Assistant, a friendly and helpful AI chatbot for a fashion and outfit curation app. Your goal is to assist users with their fashion-related questions, offer style advice, help them navigate the app, or provide general conversation. Be concise and positive. If asked about your capabilities, mention you can discuss fashion, suggest outfits based on descriptions, and help with app features. Do not refer to yourself as an AI language model if possible; be 'AestheFit Assistant'.";

const chatWithBotFlow = ai.defineFlow(
  {
    name: 'chatWithBotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Construct the message array for Genkit, starting with system instruction
    const messages: MessageData[] = [{ role: 'system', content: [{text: SYSTEM_INSTRUCTION}] }];

    // Add history messages
    if (input.history) {
      input.history.forEach(msg => {
        messages.push({
          role: msg.sender === 'ai' ? 'model' : 'user',
          content: [{ text: msg.text }],
        });
      });
    }

    // Add the latest user input
    messages.push({ role: 'user', content: [{ text: input.userInput }] });

    const response = await ai.generate({
      // Using the default model configured in genkit.ts (e.g., gemini-2.0-flash)
      prompt: messages,
      config: {
        temperature: 0.7,
        safetySettings: [ // Basic safety settings
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    const aiResponse = response.text;
    if (!aiResponse) {
      // Check if there's more info in the response, e.g. safety ratings
      const candidate = response.candidates[0];
      if (candidate?.finishReason === 'SAFETY') {
         throw new Error('AI response was blocked due to safety settings. Please rephrase your message.');
      }
      throw new Error('AI did not return a text response.');
    }
    return { aiResponse };
  }
);
