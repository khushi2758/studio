
"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  // In a real app, NEVER store passwords like this. This is for demo only.
  // You would store a hashed password.
  password?: string; 
}

interface AuthContextType {
  currentUser: User | null;
  users: User[]; // In-memory user "database"
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to persist users to localStorage (still insecure for passwords)
const StoredUsersKey = 'demoAppUsers';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true to check localStorage
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Load users from localStorage on initial mount
    try {
      const storedUsers = localStorage.getItem(StoredUsersKey);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      // Check for a currently logged-in user (simple session persistence)
      const storedCurrentUserEmail = localStorage.getItem('currentUserEmail');
      if(storedCurrentUserEmail){
        const parsedStoredUsers = JSON.parse(storedUsers || "[]") as User[];
        const foundUser = parsedStoredUsers.find(u => u.email === storedCurrentUserEmail);
        if(foundUser) {
            setCurrentUser(foundUser);
        }
      }
    } catch (error) {
      console.error("Failed to load users from localStorage", error);
      // Potentially clear corrupted storage
      // localStorage.removeItem(StoredUsersKey); 
      // localStorage.removeItem('currentUserEmail');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Persist users to localStorage whenever the users array changes
    // This is still highly insecure for passwords.
    if(!isLoading) { // Avoid writing initial empty state if still loading
        try {
            localStorage.setItem(StoredUsersKey, JSON.stringify(users));
        } catch (error) {
            console.error("Failed to save users to localStorage", error);
            toast({
                title: "Storage Error",
                description: "Could not save user data. Local storage might be full.",
                variant: "destructive",
            });
        }
    }
  }, [users, isLoading, toast]);


  const signUp = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    if (users.find(user => user.email === email)) {
      toast({ title: "Sign Up Failed", description: "Email already exists.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }

    const newUser: User = { id: crypto.randomUUID(), email, password };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('currentUserEmail', newUser.email); // Persist login
    toast({ title: "Sign Up Successful!", description: `Welcome, ${email}!` });
    setIsLoading(false);
    return true;
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserEmail', user.email); // Persist login
      toast({ title: "Sign In Successful!", description: `Welcome back, ${email}!` });
      setIsLoading(false);
      return true;
    } else {
      toast({ title: "Sign In Failed", description: "Invalid email or password.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserEmail'); // Clear persisted login
    toast({ title: "Signed Out", description: "You have been signed out." });
    router.push('/');
  };
  
  return (
    <AuthContext.Provider value={{ currentUser, users, signUp, signIn, signOut, isLoading }}>
      {isLoading ? (
         <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
