"use client";

import { useFormBuilderStore } from '@/stores/formBuilderStore';
import ImageEditor from './editor/ImageEditor';

/**
 * Media Editor Provider
 * This component renders the image editor when editing is active
 * It should be included in a high-level layout component
 */
export default function MediaEditorProvider() {
  const { isEditing } = useFormBuilderStore();
  
  if (!isEditing) return null;
  
  return <ImageEditor />;
}
