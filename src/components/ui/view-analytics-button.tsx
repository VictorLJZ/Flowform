import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart } from 'lucide-react';

interface ViewAnalyticsButtonProps {
  formId: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ViewAnalyticsButton({ 
  formId, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: ViewAnalyticsButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.push(`/dashboard/${formId}/analytics`)}
      className={className}
      aria-label="View form analytics"
    >
      <BarChart className="w-4 h-4 mr-2" />
      Analytics
    </Button>
  );
}
