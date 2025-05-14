"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MessageCircle, Trash2, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useChatSessionsStore } from '@/stores/chatSessionsStore';
import { UiSessionInfo } from '@/types/conversation/UiConversation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DialogTrigger } from "@/components/ui/dialog";

interface ChatSessionsProps {
  formId: string;
}

export function ChatSessions({ formId }: ChatSessionsProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const { 
    sessions,
    currentSessionId,
    isLoading,
    error: storeError,
    setCurrentSession, 
    createSession, 
    deleteSession,
    fetchSessions,
    clearAllSessions
  } = useChatSessionsStore();
  
  // Load sessions on mount
  useEffect(() => {
    if (formId) {
      fetchSessions(formId);
    }
  }, [formId, fetchSessions]);
  
  // Handler for selecting a session
  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
  };
  
  // Handler for creating a new session
  const handleNewSession = async () => {
    try {
      await createSession(formId);
    } catch (error) {
      console.error("Error creating new chat session", error);
    }
  };

  // Handler for deleting a session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Error deleting chat session", error);
    }
  };
  
  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return "recently";
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearAllSessions(formId);
      setIsClearDialogOpen(false); // Close dialog after successful clear
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  return (
    <div className="w-full border rounded-md">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-medium">Chat Sessions</h3>
        <div className="flex items-center gap-2">
          <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-destructive hover:text-destructive"
                disabled={isLoading || sessions.length === 0}
              >
                <Trash className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </DialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-destructive/10 p-2 rounded-full">
                    <Trash className="h-5 w-5 text-destructive" />
                  </div>
                  <AlertDialogTitle className="text-xl font-semibold">
                    Clear Chat History
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-base">
                  Are you sure you want to clear all chat history? This action cannot be undone and will permanently delete all your chat sessions and messages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 my-2 border-y">
                <p className="text-sm text-muted-foreground">
                  This will remove all chat sessions and their associated messages for this form.
                </p>
              </div>
              <AlertDialogFooter className="gap-2 sm:gap-0">
                <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearHistory}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4" />
                      Clear History
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewSession}
            className="h-8 px-2"
            disabled={isLoading}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading sessions...
            </div>
          ) : storeError ? (
            <div className="text-center py-4 text-destructive text-sm">
              {storeError}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No previous chat sessions
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`
                  p-2 rounded-md cursor-pointer flex items-start
                  ${currentSessionId === session.id ? 'bg-muted' : 'hover:bg-muted/50'}
                `}
              >
                <MessageCircle className="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium truncate">{session.title}</div>
                    <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {session.updatedAt 
                        ? formatTimeAgo(session.updatedAt) 
                        : formatTimeAgo(session.createdAt)}
                    </div>
                  </div>
                  
                  {session.lastMessage && (
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {session.lastMessage}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1 text-muted-foreground opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteSession(session.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 