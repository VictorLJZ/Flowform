import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { VersionedResponse } from '@/types/form-version-types';
import { TanStackTable } from '@/components/ui/tanstack-table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
}

export function VersionedResponsesTable({
  responses,
  loading = false,
}: VersionedResponsesTableProps) {
  // Transform the responses into a format suitable for the table
  const data = useMemo(() => {
    return responses.map((response) => {
      // Create a map of block IDs to answers
      const answerMap: Record<string, string> = {};

      // Process static answers (questions with a single answer)
      response.static_answers.forEach((answer) => {
        answerMap[answer.block_id] = answer.answer || '';
      });

      // Process dynamic responses (questions with multiple answers or complex structures)
      response.dynamic_responses.forEach((dynamicResponse) => {
        if (dynamicResponse.conversation && dynamicResponse.conversation.length > 0) {
          try {
            // Extract answers from the conversation
            const answers = dynamicResponse.conversation.map(qa => qa.answer).filter(Boolean);
            
            // For dynamic responses, we join all answers into a single string
            const responseData = answers;
                
            // Handle different response formats based on block type
            if (Array.isArray(responseData)) {
              // For multi-select or checkbox questions
              answerMap[dynamicResponse.block_id] = responseData.join(', ');
            } else if (typeof responseData === 'object') {
              // For complex object responses
              answerMap[dynamicResponse.block_id] = JSON.stringify(responseData);
            } else {
              // For simple value responses
              answerMap[dynamicResponse.block_id] = String(responseData);
            }
          } catch (error) {
            console.error('Error parsing dynamic response:', error);
            answerMap[dynamicResponse.block_id] = 'Error parsing response';
          }
        } else {
          answerMap[dynamicResponse.block_id] = '';
        }
      });

      return {
        id: response.id,
        startedAt: response.started_at,
        completedAt: response.completed_at,
        respondentId: response.respondent_id,
        status: response.status,
        version: response.form_version?.version_number || null,
        answers: answerMap,
      };
    });
  }, [responses]);

  // Create a dynamic set of columns based on the responses
  const columns = useMemo<ColumnDef<VersionedResponseRow>[]>(() => {
    // Get all unique block IDs from all responses
    const blockMap = new Map<string, string>();
    
    responses.forEach((response) => {
      if (response.version_blocks) {
        response.version_blocks.forEach((block) => {
          if (!blockMap.has(block.block_id) && !block.is_deleted) {
            blockMap.set(block.block_id, block.title || 'Untitled Question');
          }
        });
      }
    });

    // Generate columns dynamically
    const dynamicColumns: ColumnDef<VersionedResponseRow>[] = Array.from(blockMap.entries()).map(
      ([blockId, title]) => ({
        accessorFn: (row) => row.answers[blockId] || '',
        id: blockId,
        header: title,
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate">{row.getValue(blockId) || '-'}</div>
        ),
      })
    );

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
  }, [responses]);

  return (
    <div className="space-y-4">
      <TanStackTable
        columns={columns}
        data={data}
      />
      {loading && <div className="mt-4 text-center">Loading responses...</div>}
    </div>
  );
}
