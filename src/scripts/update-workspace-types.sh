#!/bin/bash

# Update type references in function signatures and variable declarations
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: Workspace/: DbWorkspace/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: Workspace\[]/: DbWorkspace[]/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: Promise<Workspace/: Promise<DbWorkspace/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: WorkspaceMember/: DbWorkspaceMember/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: WorkspaceInvitation/: DbWorkspaceInvitation/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: Promise<WorkspaceMember/: Promise<DbWorkspaceMember/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: Promise<WorkspaceInvitation/: Promise<DbWorkspaceInvitation/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/as Workspace/as DbWorkspace/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/as WorkspaceMember/as DbWorkspaceMember/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/as WorkspaceInvitation/as DbWorkspaceInvitation/g' {} \;

# Update any WorkspaceRole from workspace-types to DbWorkspaceRole
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/import { WorkspaceRole } from '"'"'@\/types\/workspace-types'"'"';/import { DbWorkspaceRole } from '"'"'@\/types\/workspace'"'"';/g' {} \;
find ./src/services/workspace -name "*.ts" -exec sed -i '' 's/: WorkspaceRole/: DbWorkspaceRole/g' {} \;

echo "Updated workspace type references in function signatures and variable declarations"
