"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Database } from 'lucide-react';
import EmbeddingProcessor from './EmbeddingProcessor';

interface ProcessEmbeddingsButtonProps {
  formId: string;
}

export function ProcessEmbeddingsButton({ formId }: ProcessEmbeddingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="h-4 w-4 mr-2" />
          Prepare Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <EmbeddingProcessor formId={formId} />
      </DialogContent>
    </Dialog>
  );
} 