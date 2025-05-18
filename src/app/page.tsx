
"use client";

import { useState, useEffect } from 'react';
import type { ClothingItem, Outfit, PersonImage } from '@/lib/types';
import ClothingUploadForm from '@/components/app/ClothingUploadForm';
import ClothingItemCard from '@/components/app/ClothingItemCard';
import OutfitCuration from '@/components/app/OutfitCuration';
import SavedOutfits from '@/components/app/SavedOutfits';
import PersonImageUploadForm from '@/components/app/PersonImageUploadForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shirt, UserCircle2 } from 'lucide-react';
import Image from 'next/image';

const MAX_ITEMS = 10;

export default function HomePage() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [personImage, setPersonImage] = useState<PersonImage | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load from localStorage if available
    const storedClothing = localStorage.getItem('clothingItems');
    if (storedClothing) {
      setClothingItems(JSON.parse(storedClothing));
    }
    const storedOutfits = localStorage.getItem('savedOutfits');
    if (storedOutfits) {
      // Outfits loaded from storage will not have generatedOutfitImageUri
      setSavedOutfits(JSON.parse(storedOutfits));
    }
    const storedPersonImage = localStorage.getItem('personImage');
    if (storedPersonImage) {
      setPersonImage(JSON.parse(storedPersonImage));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('clothingItems', JSON.stringify(clothingItems));
    }
  }, [clothingItems, isClient]);

  useEffect(() => {
    if (isClient) {
      // Create a version of savedOutfits without the large image data for localStorage
      const outfitsForStorage = savedOutfits.map(outfit => {
        const { generatedOutfitImageUri, ...rest } = outfit; // Destructure to remove it
        return rest; // Return outfit object without the image URI for storage
      });
      try {
        localStorage.setItem('savedOutfits', JSON.stringify(outfitsForStorage));
      } catch (error) {
        console.error("Error saving outfits to localStorage:", error);
        // Potentially notify user or handle more gracefully if even stripped down data is too large
      }
    }
  }, [savedOutfits, isClient]);

  useEffect(() => {
    if (isClient) {
      if (personImage) {
        localStorage.setItem('personImage', JSON.stringify(personImage));
      } else {
        localStorage.removeItem('personImage');
      }
    }
  }, [personImage, isClient]);

  const handleAddItem = (item: ClothingItem) => {
    if (clothingItems.length < MAX_ITEMS) {
      setClothingItems((prevItems) => [...prevItems, item]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setClothingItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleSaveOutfit = (outfit: Outfit) => {
    // The outfit object here will contain generatedOutfitImageUri from curation
    setSavedOutfits((prevOutfits) => [outfit, ...prevOutfits]);
  };

  const handleRemoveOutfit = (outfitId: string) => {
    setSavedOutfits((prevOutfits) => prevOutfits.filter((outfit) => outfit.id !== outfitId));
  };

  const handleSetPersonImage = (image: PersonImage | null) => {
    setPersonImage(image);
  };
  
  if (!isClient) {
    // Render a loading state or null during SSR to avoid hydration mismatch with localStorage
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Wardrobe and Person Image */}
        <div className="lg:col-span-2 space-y-8">
           {/* Clothing Upload and Wardrobe Display Section */}
          <section aria-labelledby="wardrobe-title">
            <Card className="shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle id="wardrobe-title" className="text-2xl flex items-center">
                  <Shirt className="mr-3 h-7 w-7 text-primary" />
                  Manage Your Wardrobe
                </CardTitle>
                <CardDescription>
                  Add items to your digital closet. You can upload up to {MAX_ITEMS} pieces.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-2 rounded-lg">
                  <ClothingUploadForm onAddItem={handleAddItem} itemCount={clothingItems.length} />
                </div>
                <div className="md:col-span-2">
                  {clothingItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-1 max-h-[600px] overflow-y-auto">
                      {clothingItems.map((item) => (
                        <ClothingItemCard key={item.id} item={item} onRemove={handleRemoveItem} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-10 border border-dashed rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-archive-restore text-muted-foreground opacity-50"><path d="M14 2H8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12v-4M6 14H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2"></path><path d="M18 16h-4v4h4v-4Z"></path><path d="M12 12v4h4"></path><path d="M18 4v4h4"></path></svg>
                      <p className="mt-4 text-center text-muted-foreground">Your wardrobe is currently empty.</p>
                      <p className="text-sm text-center text-muted-foreground">Start by adding some clothing items using the form.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Column: Person Image Upload and Outfit Curation */}
        <div className="lg:col-span-1 space-y-8">
          {/* Person Image Upload Section */}
          <section aria-labelledby="person-image-title">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle id="person-image-title" className="text-2xl flex items-center">
                  <UserCircle2 className="mr-3 h-7 w-7 text-primary" />
                  Your Try-On Model
                </CardTitle>
                <CardDescription>
                  Upload an image of yourself or a model for virtual try-on.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonImageUploadForm currentPersonImage={personImage} onSetPersonImage={handleSetPersonImage} />
              </CardContent>
            </Card>
          </section>

           {/* Outfit Curation Section */}
          {clothingItems.length > 0 && (
            <section aria-labelledby="curate-title">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle id="curate-title" className="text-2xl">Curate Your Outfit</CardTitle>
                  <CardDescription>
                    Specify an occasion and let AI suggest an outfit and generate an image.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OutfitCuration 
                    clothingItems={clothingItems} 
                    personImage={personImage} 
                    onSaveOutfit={handleSaveOutfit} 
                  />
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>
      
      <Separator />

      {/* Saved Outfits (Lookbook) Section */}
      <section aria-labelledby="lookbook-title">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle id="lookbook-title" className="text-2xl">Your Lookbook</CardTitle>
            <CardDescription>
              Browse your saved outfits for inspiration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SavedOutfits savedOutfits={savedOutfits} onRemoveOutfit={handleRemoveOutfit} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
