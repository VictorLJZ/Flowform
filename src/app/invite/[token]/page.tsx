"use client";

import { useParams } from 'next/navigation';
import { InvitePageClient } from './client';

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  
  return <InvitePageClient token={token} />;
}
