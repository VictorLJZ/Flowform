import { useState, useEffect } from 'react';
import { getVersionedFormResponses, getFormVersions } from '@/services/analytics/getVersionedFormResponses';
import { VersionedResponse, FormVersion } from '@/types/form-version-types';

/**
 * Custom hook to fetch versioned form responses and form versions
 * @param formId Form ID to fetch responses for
 * @param limit Maximum number of responses to fetch
 * @param offset Pagination offset
 * @returns Object containing responses, versions, loading state, and error
 */
export function useVersionedFormResponses(
  formId: string | undefined,
  limit: number = 50,
  offset: number = 0
) {
  const [responses, setResponses] = useState<VersionedResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [versions, setVersions] = useState<FormVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<FormVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!formId) {
        if (isMounted) {
          setLoading(false);
          setResponses([]);
          setTotalCount(0);
          setVersions([]);
          setCurrentVersion(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch both form versions and responses in parallel
        const [responsesResult, versionsResult] = await Promise.all([
          getVersionedFormResponses(formId, limit, offset),
          getFormVersions(formId)
        ]);

        if (isMounted) {
          setResponses(responsesResult.responses);
          setTotalCount(responsesResult.totalCount);
          setVersions(versionsResult.versions);
          setCurrentVersion(versionsResult.currentVersion);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching versioned form data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch form data'));
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [formId, limit, offset]);

  return {
    responses,
    totalCount,
    versions,
    currentVersion,
    loading,
    error
  };
}
