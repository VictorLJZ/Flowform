import { DbForm } from './DbForm';
import { DbBlock, DbBlockOption, DbDynamicBlockConfig } from '@/types/block/DbBlock';
import { WorkflowEdge } from '@/types/supabase-types';

/**
 * Complete form data including blocks for client-side use
 * This matches the format returned by the form API endpoints
 */
export type CompleteForm = DbForm & {
  blocks: (DbBlock & {
    dynamic_config: DbDynamicBlockConfig | null;
    options: DbBlockOption[] | null;
  })[];
  workflow_edges: WorkflowEdge[];
};
