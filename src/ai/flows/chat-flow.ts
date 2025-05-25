'use server';
/**
 * @fileOverview AI Chatbot flow.
 *
 * - chatWithBot - A function that handles chatbot conversations.
 * - ChatInput - The input type for the chatWithBot function.
 * - ChatOutput - The return type for the chatWithBot function.       
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { MessageData } from 'genkit'; // Keep this import even if not used by AI to avoid breaking changes if AI is re-enabled

// Schema for individual messages in the history from the client's perspective
const ChatMessageSchema = z.object({
  sender: z.enum(['user', 'ai']).describe("The sender of the message, either 'user' or 'ai'."),
  text: z.string().describe("The content of the message."),
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

// SYSTEM_INSTRUCTION is not used in this hardcoded version but kept for potential future re-enablement of AI
const SYSTEM_INSTRUCTION = `You are AestheFit Assistant, a friendly, knowledgeable, and highly skilled personal stylist AI...`; // Shortened for clarity

const chatWithBotFlow = ai.defineFlow(
  {
    name: 'chatWithBotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const userInputNormalized = input.userInput.trim().toLowerCase();
    const messages: MessageData[] = [];

    if (input.history) {
      messages.push(
        ...input.history.map((msg) => ({
          role: msg.sender === 'user' ? 'user' as const : 'model' as const,
          content: [{ type: 'text', text: msg.text }],
        }))
      );
    }
    messages.push({
      role: 'user',
      content: [{ type: 'text', text: input.userInput }],
    });

    // Specific Q&A pairs
    if (userInputNormalized === 'hi') {
      return { aiResponse: "How can I help you?" };
    } else if (userInputNormalized === "what should i wear for a wedding?") {
      return {
        aiResponse:
          "For a wedding, consider wearing a formal or semi-formal outfit. A classy dress or a tailored jumpsuit works well. Avoid white unless it's specified in the dress code.",
      };
    } else if (userInputNormalized === "what's trending in fashion right now?") {
      return {
        aiResponse:
          "Trends this season include oversized blazers, monochrome outfits, pastel tones, and statement accessories.",
      };
    } else if (userInputNormalized === "how do i style high-waisted jeans?") {
      return {
        aiResponse:
          "Pair them with a crop top, a tucked-in blouse, or a fitted shirt. Add heels or sneakers depending on the occasion.",
      };
    } else if (userInputNormalized === "i have a date tonight, what should i wear?") {
      return {
        aiResponse:
          "Choose something that makes you feel confident and comfortable. A midi dress or chic top with tailored pants is a great choice.",
      };
    } else if (userInputNormalized === "what should i wear to a beach party?") {
      return {
        aiResponse:
          "Go for a flowy sundress or a stylish swimsuit with a cover-up and comfy sandals.",
      };
    } else if (userInputNormalized === "suggest an outfit for winter.") {
      return {
        aiResponse:
          "Layer up with a cozy sweater, a long coat, skinny jeans, and ankle boots. Add a scarf and gloves for extra warmth.",
      };
    } else if (userInputNormalized === "thank you") {
      return {
        aiResponse: "Anytime! Let me know if you need more fashion tips 💁‍♀️",
      };
    } else {
      const result = await ai.chat({
          messages,
          systemInstruction: SYSTEM_INSTRUCTION,
        });
      return { aiResponse: result.text };
    }
  }
);
