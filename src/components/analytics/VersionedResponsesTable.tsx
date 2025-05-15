import React, { useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { VersionedResponse, FormBlockVersion } from '@/types/form-version-types';
import { TanStackTable } from '@/components/ui/tanstack-table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Debug flag - set to true to enable detailed logging
const DEBUG = true;

// Map of status values to color variants
const statusColorMap: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-700 border-green-600/20',
  in_progress: 'bg-yellow-500/20 text-yellow-700 border-yellow-600/20',
  abandoned: 'bg-red-500/20 text-red-700 border-red-600/20',
};

interface VersionedResponseRow {
  id: string;
  startedAt: string;
  completedAt: string | null;
  respondentId: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  version: number | null;
  answers: Record<string, string>;
}

interface VersionedResponsesTableProps {
  responses: VersionedResponse[];
  loading?: boolean;
  selectedVersionId?: string | 'all';
}

export function VersionedResponsesTable({
  responses,
  loading = false,
  selectedVersionId = 'all',
}: VersionedResponsesTableProps): React.ReactNode {
  
  // Debug log responses when component renders or updates
  useEffect(() => {
    if (DEBUG) {
      console.log(`[VersionedResponsesTable] Received ${responses.length} responses`);
      if (responses.length > 0) {
        // Check if responses have version_blocks
        const withVersionBlocks = responses.filter(r => r.version_blocks && r.version_blocks.length > 0).length;
        console.log(`[VersionedResponsesTable] Responses with version_blocks: ${withVersionBlocks}/${responses.length}`);
        
        // Log the first response for inspection
        const firstResponse = responses[0];
        console.log('[VersionedResponsesTable] First response:', {
          id: firstResponse.id,
          // Access form_version_id through form_version if it exists
          form_version_id: firstResponse.form_version?.id,
          hasVersion: !!firstResponse.form_version,
          versionBlocksCount: firstResponse.version_blocks?.length || 0,
          staticAnswersCount: firstResponse.static_answers?.length || 0,
          dynamicResponsesCount: firstResponse.dynamic_responses?.length || 0
        });
        
        if (firstResponse.version_blocks && firstResponse.version_blocks.length > 0) {
          console.log('[VersionedResponsesTable] Sample version blocks:', 
            firstResponse.version_blocks.slice(0, 3).map(b => ({
              id: b.id,
              block_id: b.block_id,
              title: b.title,
              is_deleted: b.is_deleted
            }))
          );
        } else {
          console.warn('[VersionedResponsesTable] First response has no version_blocks');
        }
      }
    }
  }, [responses, selectedVersionId]);
  // Transform the responses into a format suitable for the table
  const data = useMemo(() => {
    return responses.map((response) => {
      // Create a map of block IDs to answers
      const answerMap: Record<string, string> = {};

      // Get the version number for this response
      const versionNumber = response.form_version?.version_number || null;
      // versionId is available from the API but not used in this component currently

      // Process static answers (questions with a single answer)
      response.static_answers.forEach((answer) => {
        // For versioned view, indicate which version this answer belongs to when in all versions mode
        const answerText = answer.answer || '';
        // ApiStaticBlockAnswer uses camelCase property names per API layer convention
        answerMap[answer.blockId] = selectedVersionId === 'all' && versionNumber 
          ? `${answerText} ${versionNumber > 1 ? `(v${versionNumber})` : ''}`.trim()
          : answerText;
      });

      // Process dynamic responses (questions with multiple answers or complex structures)
      response.dynamic_responses?.forEach((dynamicResponse) => {
        if (dynamicResponse.conversation && dynamicResponse.conversation.length > 0) {
          try {
            // Extract answers from the conversation
            const qa = dynamicResponse.conversation[0];
            // ApiQAPair uses 'content' property, not 'answer'
            const responseData = JSON.parse(qa?.content || '{}');
            
            // Process the response data based on its type
                
            // Handle different response formats based on block type
            if (Array.isArray(responseData)) {
              // For multi-select or checkbox questions
              answerMap[dynamicResponse.blockId] = responseData.join(', ');
            } else if (typeof responseData === 'object') {
              // For complex object responses
              answerMap[dynamicResponse.blockId] = JSON.stringify(responseData);
            } else {
              // For simple value responses
              answerMap[dynamicResponse.blockId] = String(responseData);
            }
          } catch (error) {
            console.error('Error parsing dynamic response:', error);
            answerMap[dynamicResponse.blockId] = 'Error parsing response';
          }
        } else {
          answerMap[dynamicResponse.blockId] = '';
        }
      });

      return {
        id: response.id,
        // ApiFormResponse uses camelCase per API layer convention
        startedAt: response.startedAt || '-',
        completedAt: response.completedAt || null,
        respondentId: response.respondentId || 'Anonymous',
        status: response.status,
        version: response.form_version?.version_number || null,
        answers: answerMap,
      };
    });
  }, [responses, selectedVersionId]);

  // Create a dynamic set of columns based on the responses
  const columns = useMemo<ColumnDef<VersionedResponseRow>[]>(() => {
    // Build a map of unique block IDs to their titles
    const blockMap = new Map<string, string>();
  
    // For tracking version evolution of blocks
    const blockVersions = new Map<string, Map<number, string>>();
  
    let responsesWithBlocks = 0;
    let responsesWithoutBlocks = 0;
    let totalBlocks = 0;
    let deletedBlocks = 0;
  
    responses.forEach((response) => {
      if (response.version_blocks && response.version_blocks.length > 0) {
        responsesWithBlocks++;
        totalBlocks += response.version_blocks.length;
        
        // Include ALL blocks for historical analytics, regardless of deletion status
        response.version_blocks.forEach((block: FormBlockVersion) => {
          if (block.is_deleted) {
            deletedBlocks++;
          } else {
            // Normal blocks mapping
            if (!blockMap.has(block.block_id)) {
              blockMap.set(block.block_id, block.title || 'Untitled Question');
            }
            
            // Track versions of each block for historical view
            const versionNumber = response.form_version?.version_number;
            if (versionNumber) {
              if (!blockVersions.has(block.block_id)) {
                blockVersions.set(block.block_id, new Map());
              }
              const versionMap = blockVersions.get(block.block_id);
              if (versionMap && !versionMap.has(versionNumber)) {
                versionMap.set(versionNumber, block.title || 'Untitled Question');
              }
            }
          }
        });
      } else {
        responsesWithoutBlocks++;
      }
    });
    
    if (DEBUG) {
      console.log('[VersionedResponsesTable] Block collection stats:', {
        responsesWithBlocks,
        responsesWithoutBlocks,
        totalBlocks, 
        deletedBlocks,
        uniqueBlocksFound: blockMap.size
      });
      
      if (blockMap.size === 0) {
        console.warn('[VersionedResponsesTable] ⚠️ No blocks found for columns! This will result in no question columns.');
      } else {
        console.log('[VersionedResponsesTable] Blocks for columns:', Array.from(blockMap.entries()).map(([id, title]) => ({ id, title })));
      }
    }

    // Generate columns dynamically
    const dynamicColumns: ColumnDef<VersionedResponseRow>[] = Array.from(blockMap.entries()).map(
      ([blockId, title]) => {
        // Check if this block has different versions
        const versions = blockVersions.get(blockId);
        const hasMultipleVersions = versions && versions.size > 1;
        
        // For multi-version blocks, create a tooltip or enhanced header
        let enhancedTitle = title;
        let tooltip = '';
        
        if (hasMultipleVersions && selectedVersionId === 'all') {
          // Create a tooltip showing how this question evolved across versions
          const versionChanges = Array.from(versions!.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([version, text]) => `v${version}: ${text}`)
            .join('\n');
          
          tooltip = `This question changed across versions:\n${versionChanges}`;
          enhancedTitle = `${title} (changed across versions)`;
        }
        
        return ({
          accessorFn: (row) => row.answers[blockId] || '',
          id: blockId,
          header: enhancedTitle,
          cell: ({ row }) => (
            <div 
              className="max-w-[300px] truncate" 
              title={tooltip || undefined}
            >
              {row.getValue(blockId) || '-'}
            </div>
          ),
        });
      }
    );
    
    if (DEBUG) {
      console.log(`[VersionedResponsesTable] Generated ${dynamicColumns.length} dynamic question columns`);
    }

    // Include static columns first, then dynamic question columns
    return [
      {
        accessorKey: 'respondentId',
        header: 'Respondent ID',
        cell: ({ row }) => (
          <div className="max-w-[150px] truncate font-medium">
            {row.getValue('respondentId')}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-normal',
                statusColorMap[status] || 'bg-gray-500/20 text-gray-700 border-gray-600/20'
              )}
            >
              {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'version',
        header: 'Version',
        cell: ({ row }) => {
          const version = row.getValue('version');
          return version ? `v${version}` : 'Latest';
        },
      },
      {
        accessorKey: 'startedAt',
        header: 'Started',
        cell: ({ row }) => {
          const startDate = new Date(row.getValue('startedAt') as string);
          return format(startDate, 'MMM d, yyyy h:mm a');
        },
      },
      {
        accessorKey: 'completedAt',
        header: 'Completed',
        cell: ({ row }) => {
          const completed = row.getValue('completedAt') as string | null;
          return completed ? format(new Date(completed), 'MMM d, yyyy h:mm a') : '-';
        },
      },
      ...dynamicColumns,
    ];
  }, [responses, selectedVersionId]);

  // Get the dynamic columns from the columns array
  const dynamicColsCount = columns.length - 5; // Subtract the 5 static columns
  
  return (
    <div className="space-y-4">
      {DEBUG && dynamicColsCount === 0 && (
        <div className="p-4 mb-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-md">
          <h3 className="font-semibold">Debug Info: No Question Columns</h3>
          <p className="text-sm">No question columns were generated. This could be because:</p>
          <ul className="text-sm list-disc pl-5 mt-2">
            <li>Responses don&apos;t have valid form_version_id values</li>
            <li>No block versions were found for the response versions</li>
            <li>All blocks are marked as deleted</li>
          </ul>
        </div>
      )}
      
      <div>
        {/* Version indicator when viewing a specific version */}
        {selectedVersionId !== 'all' && (
          <div className="text-xs text-muted-foreground mb-3 italic">
            Showing form structure exactly as it appeared in this version.
          </div>
        )}
        
        {responses.length === 0 && <p className="text-center text-muted-foreground py-8">No responses found. Either no one&apos;s submitted the form, or the responses don&apos;t match your filters.</p>}
        
        <div className="custom-scrollbar">
          <style jsx global>{`
            /* Custom scrollbar styles */
            .custom-scrollbar .tanstack-table-container {
              overflow-x: auto;
              scrollbar-gutter: stable both-edges;
            }
            
            /* Webkit browsers (Chrome, Safari, newer Edge) */
            .custom-scrollbar .tanstack-table-container::-webkit-scrollbar {
              height: 3px; /* Even thinner scrollbar */
              background: transparent;
            }
            
            .custom-scrollbar .tanstack-table-container::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .custom-scrollbar .tanstack-table-container::-webkit-scrollbar-thumb {
              background-color: rgba(155, 155, 155, 0.5); /* More subtle thumb color */
              border-radius: 20px;
            }
            
            /* Firefox */
            .custom-scrollbar .tanstack-table-container {
              scrollbar-width: thin;
              scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
            }
          `}</style>
          
          <TanStackTable
            columns={columns}
            data={data}
          />
        </div>
      </div>
      {loading && <div className="mt-4 text-center">Loading responses...</div>}
    </div>
  );
}
