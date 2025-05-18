
export type ClothingItem = {
  id: string;
  name: string;
  description: string;
  imagePreview: string; // For client-side preview
  imageDataUri: string; // For AI processing (data:image/jpeg;base64,...)
};

export type Outfit = {
  id: string;
  occasion: string;
  itemsUsedDataUris: string[]; // Store which specific items (by data URI) were used by AI
  itemNames: string[]; // Store names of items used for display
  suggestion: string;
  savedAt: string; // ISO string date
};

export type PersonImage = {
  id: string;
  imagePreview: string; // For client-side preview
  imageDataUri: string; // For AI processing (data:image/jpeg;base64,...)
};
