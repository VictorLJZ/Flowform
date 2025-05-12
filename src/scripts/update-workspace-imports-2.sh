#!/bin/bash

# Update WorkspaceMemberWithProfile import
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { WorkspaceMemberWithProfile } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceMemberWithProfile } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update WorkspaceInput import
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { WorkspaceInput } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceInput } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update ApiErrorResponse import
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { ApiErrorResponse } from '"'"'@\/types\/workspace-types'"'"';/import { ApiErrorResponse } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update WorkspaceMemberBasic import
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { WorkspaceMemberBasic } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceMemberBasic } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update WorkspaceUpdateInput import
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { WorkspaceUpdateInput } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceUpdateInput } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update multiple imports from workspace-types
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { \(.*\), \(.*\) } from '"'"'@\/types\/workspace-types'"'"';/import { \1, \2 } from '"'"'@\/types\/workspace'"'"';/g' {} \;

echo "Updated remaining workspace type imports from workspace-types.ts to workspace/index.ts"
