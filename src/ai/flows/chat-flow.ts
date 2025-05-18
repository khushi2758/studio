
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

const SYSTEM_INSTRUCTION = `You are AestheFit Assistant, a friendly, knowledgeable, and highly skilled personal stylist AI. Your primary goal is to provide an engaging and helpful conversational experience, assisting users with all their fashion needs.

Your capabilities include:
- Answering fashion-related questions: Be ready to discuss trends, color pairings, style advice for different body types, what to wear for specific occasions (e.g., "What should I wear to a garden wedding?"), and more.
- Suggesting outfits: Based on user inputs such as body type, season, occasion, personal style preferences, or even specific clothing items they mention, offer thoughtful outfit suggestions.
- Guiding users through the app: Help users understand how to use app features, such as uploading photos of their clothes or setting preferences.
- Conversational interaction: Maintain a warm, approachable, and professional tone, much like a human personal stylist. Be empathetic and patient.

When asked about your capabilities, clearly state what you can do as listed above. If you cannot fulfill a request, politely explain why and offer alternatives if possible. Avoid referring to yourself as a generic "AI language model" and instead maintain your persona as "AestheFit Assistant". Be concise and positive in your responses.`;

const chatWithBotFlow = ai.defineFlow(
  {
    name: 'chatWithBotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Diagnostic step: Simplify the prompt to only include the current user's input.
    // The history processing is temporarily bypassed to isolate the error.
    const simplifiedPrompt: MessageData[] = [
      { role: 'user', content: [{ text: input.userInput }] }
    ];

    // Original messagesForPrompt construction (commented out for diagnosis)
    // const messagesForPrompt: MessageData[] = [];
    // if (input.history) {
    //   input.history.forEach(msg => {
    //     messagesForPrompt.push({
    //       role: msg.sender === 'ai' ? 'model' : 'user',
    //       content: [{ text: msg.text }],
    //     });
    //   });
    // }
    // messagesForPrompt.push({ role: 'user', content: [{ text: input.userInput }] });

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash', // Explicitly specify the model
      prompt: simplifiedPrompt, // Using the simplified prompt
      config: {
        systemInstruction: { role: 'system', content: [{ text: SYSTEM_INSTRUCTION }] },
        temperature: 0.75,
        safetySettings: [
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    const aiResponse = response.text;
    if (!aiResponse) {
      const candidate = response.candidates[0];
      if (candidate?.finishReason === 'SAFETY') {
         throw new Error('AI response was blocked due to safety settings. Please rephrase your message or adjust safety configurations if appropriate.');
      }
      // Log more details if available
      const finishMessage = candidate?.finishMessage || 'No specific finish message provided.';
      const safetyRatings = candidate?.safetyRatings ? JSON.stringify(candidate.safetyRatings) : 'No safety ratings available.';
      console.error(`AI did not return a text response. Finish Reason: ${candidate?.finishReason}. Finish Message: ${finishMessage}. Safety Ratings: ${safetyRatings}. Full candidate: ${JSON.stringify(candidate)}`);
      throw new Error(`AI did not return a text response. Finish Reason: ${candidate?.finishReason}. Please check server logs for more details.`);
    }
    return { aiResponse };
  }
);

