
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
  generatedOutfitImageUri?: string; // AI-generated image of the outfit
  savedAt: string; // ISO string date
};

export type PersonImage = {
  id: string;
  imagePreview: string; // For client-side preview
  imageDataUri: string; // For AI processing (data:image/jpeg;base64,...)
};

export interface ChatMessageReaction {
  nickname: string;
  emoji: string; 
}

export interface ChatMessage {
  id: string;
  roomId: string;
  nickname: string;
  text?: string; // Text is now optional
  timestamp: string;
  type: 'message' | 'image';
  imageDataUri?: string; // For image messages (stored as data URI)
  reactions?: ChatMessageReaction[];
}
