#!/bin/bash

# Update Workspace imports
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { Workspace } from '"'"'@\/types\/supabase-types'"'"';/import { DbWorkspace } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update WorkspaceMember imports
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { WorkspaceMember } from '"'"'@\/types\/supabase-types'"'"';/import { DbWorkspaceMember } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update WorkspaceInvitation imports
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { WorkspaceInvitation } from '"'"'@\/types\/supabase-types'"'"';/import { DbWorkspaceInvitation } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update any imports for type Workspace
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import type { Workspace } from '"'"'@\/types\/supabase-types'"'"';/import type { DbWorkspace } from '"'"'@\/types\/workspace'"'"';/g' {} \;

echo "Updated workspace type imports from supabase-types.ts to workspace/index.ts"
