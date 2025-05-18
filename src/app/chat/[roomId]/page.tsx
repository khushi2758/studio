
"use client";

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image'; // Renamed to avoid conflict with local Image variable
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage, ChatMessageReaction } from '@/lib/types';
import { ArrowLeft, Send, User, ImagePlus, XCircle, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_IMAGE_SIZE_MB = 2; // Max image size in MB for upload

// Helper function to convert file to data URI
const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = typeof params.roomId === 'string' ? params.roomId : '';

  const [isClient, setIsClient] = useState(false);
  const [nickname, setNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingNickname, setIsLoadingNickname] = useState(true);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    if (roomId) {
      const storedNickname = localStorage.getItem(`chatRoom-${roomId}-nickname`);
      if (storedNickname) {
        setNickname(storedNickname);
      }
      setIsLoadingNickname(false);

      const storedMessages = localStorage.getItem(`chatRoom-${roomId}-messages`);
      if (storedMessages) {
        try {
          setMessages(JSON.parse(storedMessages));
        } catch (error) {
          console.error("Error parsing stored messages:", error);
          toast({ title: "Error loading chat", description: "Could not load previous messages.", variant: "destructive"});
          localStorage.removeItem(`chatRoom-${roomId}-messages`); // Clear corrupted data
        }
      }
    }
  }, [roomId, toast]);

  useEffect(() => {
    if (isClient && roomId && messages.length > 0) {
      try {
        localStorage.setItem(`chatRoom-${roomId}-messages`, JSON.stringify(messages));
      } catch (error) {
         console.error("Error saving messages to localStorage:", error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast({
            title: "Storage Limit Reached",
            description: "Cannot save more messages due to browser storage limits. Older messages or large images might be lost.",
            variant: "destructive",
            duration: 7000, 
          });
        } else {
          toast({
            title: "Storage Error",
            description: "Could not save message history.",
            variant: "destructive",
          });
        }
      }
    }
  }, [messages, roomId, isClient, toast]);
  
  useEffect(() => {
    if (isClient && roomId && nickname) {
      localStorage.setItem(`chatRoom-${roomId}-nickname`, nickname);
    }
  }, [nickname, roomId, isClient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (!isLoadingNickname && nickname && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoadingNickname, nickname]);

  const handleSetNickname = (e: FormEvent) => {
    e.preventDefault();
    if (tempNickname.trim()) {
      setNickname(tempNickname.trim());
    } else {
      toast({
        title: 'Nickname required',
        description: 'Please enter a nickname to join the chat.',
        variant: 'destructive',
      });
    }
  };

  const handleImageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: `Please select an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setSelectedImagePreview(previewUrl);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if ((!currentMessage.trim() && !selectedImageFile) || !nickname) return;

    let newMessage: ChatMessage;

    if (selectedImageFile) {
      toast({
        title: "Image Upload Notice",
        description: "Storing images in chat uses browser local storage and has significant limitations. Large images or many images may cause issues or not save permanently.",
        variant: "default",
        duration: 8000,
      });
      try {
        const imageDataUri = await fileToDataUri(selectedImageFile);
        newMessage = {
          id: crypto.randomUUID(),
          roomId,
          nickname,
          text: currentMessage.trim() || undefined,
          timestamp: new Date().toISOString(),
          type: 'image',
          imageDataUri: imageDataUri,
          reactions: [],
        };
      } catch (error) {
        console.error("Error converting image to data URI:", error);
        toast({ title: "Image Error", description: "Could not process the image.", variant: "destructive" });
        return;
      }
    } else {
      newMessage = {
        id: crypto.randomUUID(),
        roomId,
        nickname,
        text: currentMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'message',
        reactions: [], // Text messages can also have reactions in theory, initializing
      };
    }

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setCurrentMessage('');
    clearSelectedImage();
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!nickname) return;
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const userReactionIndex = existingReactions.findIndex(
            r => r.nickname === nickname && r.emoji === emoji
          );

          if (userReactionIndex > -1) {
            // User already reacted with this emoji, remove it
            return {
              ...msg,
              reactions: existingReactions.filter((_, index) => index !== userReactionIndex),
            };
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...existingReactions, { nickname, emoji }],
            };
          }
        }
        return msg;
      })
    );
  };


  if (!isClient || isLoadingNickname) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!nickname) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Enter Nickname</CardTitle>
            <CardDescription className="text-center">
              Choose a nickname to join room: <span className="font-semibold truncate block max-w-xs mx-auto">{roomId}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetNickname} className="space-y-4">
              <div>
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="Your cool nickname"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Join Chat
              </Button>
            </form>
          </CardContent>
           <CardFooter className="flex-col space-y-2 pt-4">
             <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
           </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-8rem)] flex flex-col">
      <Card className="shadow-xl flex-grow flex flex-col">
        <CardHeader className="border-b">
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
            <div className="flex-grow">
              <CardTitle className="text-xl sm:text-2xl">
                Chat Room: <span className="font-mono text-xs sm:text-sm ml-1 sm:ml-2 bg-muted px-2 py-1 rounded truncate max-w-[150px] xs:max-w-[180px] sm:max-w-[200px] md:max-w-xs inline-block align-bottom">{roomId}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Chatting as: <span className="font-semibold text-primary">{nickname}</span>
                <span className="text-xs text-muted-foreground/80 block sm:inline sm:ml-1">
                   (Messages & images are local to this browser)
                </span>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/">
                <ArrowLeft className="mr-0 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Exit Room</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-grow p-4 bg-muted/20">
          <div className="space-y-4">
            {messages.map((msg) => {
              const heartReactions = msg.reactions?.filter(r => r.emoji === '❤️').length || 0;
              const userHasHearted = msg.reactions?.some(r => r.nickname === nickname && r.emoji === '❤️');

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2 max-w-[85%]",
                    msg.nickname === nickname ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                  )}
                >
                  <User className="h-8 w-8 text-muted-foreground self-start shrink-0 rounded-full bg-background p-1 border" title={msg.nickname}/>
                  <div
                    className={cn(
                      "p-3 rounded-xl shadow-md",
                      msg.nickname === nickname
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card text-card-foreground rounded-bl-none border"
                    )}
                  >
                    <p className="text-xs text-muted-foreground/80 mb-0.5">
                      {msg.nickname === nickname ? "You" : msg.nickname}
                      <span className="ml-2 text-xs text-muted-foreground/60">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    {msg.type === 'image' && msg.imageDataUri && (
                      <div className="my-2">
                        <NextImage
                          src={msg.imageDataUri}
                          alt={msg.text || `Image from ${msg.nickname}`}
                          width={200} 
                          height={200} 
                          className="rounded-md object-contain max-w-full h-auto"
                          data-ai-hint="chat image"
                        />
                      </div>
                    )}
                    {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                    {msg.type === 'image' && (
                      <div className="mt-2 flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn("p-1 h-auto", userHasHearted ? "text-red-500" : "text-muted-foreground hover:text-red-500")}
                          onClick={() => handleReaction(msg.id, '❤️')}
                        >
                          <Heart className={cn("h-4 w-4", userHasHearted ? "fill-red-500" : "")} />
                          <span className="ml-1 text-xs">{heartReactions > 0 ? heartReactions : ''}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
             {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    No messages yet. Start the conversation or send an image!
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <CardFooter className="p-4 border-t bg-background">
          {selectedImagePreview && (
            <div className="mb-2 p-2 border rounded-md relative w-20 h-20 sm:w-24 sm:h-24"> {/* Slightly smaller on mobile */}
              <NextImage src={selectedImagePreview} alt="Selected preview" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="image preview"/>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
                onClick={clearSelectedImage}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageInputChange} 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="icon" 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              title="Add Image"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <Input
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message or add an image..."
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={(!currentMessage.trim() && !selectedImageFile) || !nickname} aria-label="Send message">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

    
