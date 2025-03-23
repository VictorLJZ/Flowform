"use client";

import { useState } from 'react';
import { FormChat } from '@/components/analytics/form-chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TestRAGPage() {
  const [formId, setFormId] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formId) {
      setShowChat(true);
    }
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Test RAG System</h1>
      
      {!showChat ? (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block mb-2">Form ID</label>
            <Input 
              value={formId} 
              onChange={(e) => setFormId(e.target.value)} 
              placeholder="Enter form ID"
            />
          </div>
          
          <Button type="submit" disabled={!formId}>
            Start Chat
          </Button>
        </form>
      ) : (
        <div className="max-w-2xl">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => setShowChat(false)}
          >
            Change Form
          </Button>
          
          <FormChat formId={formId} />
        </div>
      )}
    </div>
  );
}
