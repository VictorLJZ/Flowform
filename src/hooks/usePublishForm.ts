"use client";

import { useState } from "react";
import { useFormBuilderStore } from "@/stores/formBuilderStore";
import { publishFormWithFormBuilderStore } from "@/services/form/publishFormWithFormBuilderStore";
import { FormVersion } from "@/types/form-version-types";
import { Form } from "@/types/supabase-types";

/**
 * Hook to handle form publishing with consistent behavior
 * This centralizes the publishing logic and ensures blocks are properly included
 * 
 * @returns Functions and state for publishing forms
 */
export function usePublishForm() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get blocks from the form builder store
  const blocks = useFormBuilderStore((state) => state.blocks);
  
  /**
   * Publish a form with the current blocks from the store
   * @param formId The ID of the form to publish
   * @returns Object containing the published form and version information
   */
  const publishCurrentForm = async (formId: string): Promise<{
    form: Form;
    version?: FormVersion | null;
  }> => {
    if (isPublishing) {
      throw new Error("Already publishing");
    }

    setIsPublishing(true);
    setError(null);

    try {
      // Ensure we have blocks
      if (!blocks || blocks.length === 0) {
        console.warn("Publishing form with no blocks - this may mark all blocks as deleted in version");
      }

      // Publish with the current blocks from the store
      const result = await publishFormWithFormBuilderStore(formId, blocks);
      
      return result;
    } catch (err) {
      console.error("Error publishing form:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Publish a form with explicitly provided blocks
   * Useful when publishing from outside the form builder
   * @param formId The ID of the form to publish
   * @param blocksToPublish The blocks to publish with the form
   * @returns Object containing the published form and version information
   */
  const publishFormWithBlocks = async (
    formId: string,
    blocksToPublish: any[]
  ): Promise<{
    form: Form;
    version?: FormVersion | null;
  }> => {
    if (isPublishing) {
      throw new Error("Already publishing");
    }

    setIsPublishing(true);
    setError(null);

    try {
      // Ensure we have blocks
      if (!blocksToPublish || blocksToPublish.length === 0) {
        console.warn("Publishing form with no blocks - this may mark all blocks as deleted in version");
      }

      // Publish with the provided blocks
      const result = await publishFormWithFormBuilderStore(formId, blocksToPublish);
      
      return result;
    } catch (err) {
      console.error("Error publishing form:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    publishCurrentForm,
    publishFormWithBlocks,
    isPublishing,
    error,
  };
}
