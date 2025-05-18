// use server'

/**
 * @fileOverview Outfit curation flow.
 *
 * This file defines a Genkit flow that takes a list of clothing items (as data URIs) and an occasion,
 * and returns an outfit suggestion.
 *
 * @exports curateOutfit - The main function to call for outfit curation.
 * @exports CurateOutfitInput - The input type for the curateOutfit function.
 * @exports CurateOutfitOutput - The output type for the curateOutfit function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurateOutfitInputSchema = z.object({
  clothingItems: z
    .array(
      z
        .string()
        .describe(
          "A clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        )
    )
    .describe('An array of clothing items to choose from.'),
  occasion: z.string().describe('The occasion for which the outfit is being curated.'),
});

export type CurateOutfitInput = z.infer<typeof CurateOutfitInputSchema>;

const CurateOutfitOutputSchema = z.object({
  outfitSuggestion: z.string().describe('A description of the suggested outfit.'),
});

export type CurateOutfitOutput = z.infer<typeof CurateOutfitOutputSchema>;

export async function curateOutfit(input: CurateOutfitInput): Promise<CurateOutfitOutput> {
  return curateOutfitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curateOutfitPrompt',
  input: {schema: CurateOutfitInputSchema},
  output: {schema: CurateOutfitOutputSchema},
  prompt: `You are a personal stylist AI, helping users create outfits from their existing wardrobe.

  Given the following clothing items and occasion, suggest a stylish outfit. Be as descriptive as possible.

  Occasion: {{{occasion}}}

  Clothing Items:
  {{#each clothingItems}}
  - {{media url=this}}
  {{/each}}`,
});

const curateOutfitFlow = ai.defineFlow(
  {
    name: 'curateOutfitFlow',
    inputSchema: CurateOutfitInputSchema,
    outputSchema: CurateOutfitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
