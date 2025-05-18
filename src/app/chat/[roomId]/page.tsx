
"use client";

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage } from '@/lib/types';
import { ArrowLeft, Send, User, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load nickname and messages from localStorage
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
        setMessages(JSON.parse(storedMessages));
      }
    }
  }, [roomId]);

  // Save messages to localStorage
  useEffect(() => {
    if (isClient && roomId && messages.length > 0) {
      localStorage.setItem(`chatRoom-${roomId}-messages`, JSON.stringify(messages));
    }
  }, [messages, roomId, isClient]);
  
  // Save nickname to localStorage
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

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !nickname) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      roomId,
      nickname,
      text: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setCurrentMessage('');
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <MessageSquare className="mr-2 h-6 w-6 text-primary" />
                Fashion Chat: Room <span className="font-mono text-sm ml-2 bg-muted px-2 py-1 rounded truncate max-w-[200px] md:max-w-xs inline-block">{roomId}</span>
              </CardTitle>
              <CardDescription>
                You are chatting as: <span className="font-semibold text-primary">{nickname}</span> (Messages are local to this browser)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Home
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-grow p-4 bg-muted/20">
          <div className="space-y-4">
            {messages.map((msg) => (
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
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
             {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    No messages yet. Start the conversation!
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <CardFooter className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            {/* Placeholder for future image upload button */}
            {/* <Button variant="outline" size="icon" type="button" disabled title="Image sharing not yet implemented">
              <ImageIcon className="h-5 w-5" />
            </Button> */}
            <Input
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!currentMessage.trim()} aria-label="Send message">
              <Send className="h-5 w-5" />
            </Button>
          </form>
           {/* Placeholder for future polls feature */}
           {/* <p className="text-xs text-muted-foreground mt-2">Polls and reactions are planned for a future update!</p> */}
        </CardFooter>
      </Card>
    </div>
  );
}
