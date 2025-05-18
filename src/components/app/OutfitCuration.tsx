"use client";

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { ClothingItem, Outfit } from '@/lib/types';
import { curateOutfit } from '@/ai/flows/curate-outfit'; // Adjusted import path
import { Sparkles, Heart, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OutfitCurationProps {
  clothingItems: ClothingItem[];
  onSaveOutfit: (outfit: Outfit) => void;
}

const OutfitCuration: FC<OutfitCurationProps> = ({ clothingItems, onSaveOutfit }) => {
  const [occasion, setOccasion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [curatedSuggestion, setCuratedSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCuration = async (e: FormEvent) => {
    e.preventDefault();
    if (!occasion) {
      toast({ title: "Missing occasion", description: "Please specify an occasion for the outfit.", variant: "destructive" });
      return;
    }
    if (clothingItems.length === 0) {
      toast({ title: "No clothing items", description: "Please upload some clothing items first.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setCuratedSuggestion(null);

    try {
      const itemDataUris = clothingItems.map(item => item.imageDataUri);
      const result = await curateOutfit({ clothingItems: itemDataUris, occasion });
      setCuratedSuggestion(result.outfitSuggestion);
      toast({ title: "Outfit Curated!", description: "AI has suggested an outfit for you." });
    } catch (error) {
      console.error("Error curating outfit:", error);
      toast({ title: "Curation Error", description: "Could not generate an outfit. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOutfit = () => {
    if (!curatedSuggestion || !occasion) return;

    const newOutfit: Outfit = {
      id: crypto.randomUUID(),
      occasion,
      itemsUsedDataUris: clothingItems.map(item => item.imageDataUri), // Or be more specific if AI returns which items it used
      itemNames: clothingItems.map(item => item.name), // For simplicity, assuming all uploaded items considered. AI might specify.
      suggestion: curatedSuggestion,
      savedAt: new Date().toISOString(),
    };
    onSaveOutfit(newOutfit);
    toast({ title: "Outfit Saved!", description: "The outfit has been added to your lookbook." });
    setCuratedSuggestion(null); // Clear suggestion after saving
    // setOccasion(''); // Optionally clear occasion
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCuration} className="space-y-4">
        <div>
          <Label htmlFor="occasion" className="text-base">Occasion*</Label>
          <Input
            id="occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g., Casual Brunch, Formal Dinner"
            className="mt-1"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading || clothingItems.length === 0} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Curating...' : 'Curate Outfit'}
        </Button>
      </form>

      {curatedSuggestion && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>AI Outfit Suggestion</CardTitle>
            <CardDescription>For: {occasion}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32 pr-2">
              <p className="text-foreground">{curatedSuggestion}</p>
            </ScrollArea>
          </CardContent>
          <CardContent>
             <Button onClick={handleSaveOutfit} className="w-full">
              <Heart className="mr-2 h-4 w-4" /> Save to Lookbook
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OutfitCuration;
