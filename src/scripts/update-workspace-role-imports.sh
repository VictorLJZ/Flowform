#!/bin/bash

# Update WorkspaceRole import across the entire codebase
find ./src -name "*.ts" -exec sed -i '' 's/import { WorkspaceRole } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceRole } from '"'"'@\/types\/workspace'"'"';/g' {} \;
find ./src -name "*.tsx" -exec sed -i '' 's/import { WorkspaceRole } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceRole } from '"'"'@\/types\/workspace'"'"';/g' {} \;

# Update multiple imports that include WorkspaceRole
find ./src -name "*.ts" -exec sed -i '' 's/import { WorkspaceRole, \(.*\) } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceRole, \1 } from '"'"'@\/types\/workspace'"'"';/g' {} \;
find ./src -name "*.tsx" -exec sed -i '' 's/import { WorkspaceRole, \(.*\) } from '"'"'@\/types\/workspace-types'"'"';/import { WorkspaceRole, \1 } from '"'"'@\/types\/workspace'"'"';/g' {} \;
find ./src -name "*.ts" -exec sed -i '' 's/import { \(.*\), WorkspaceRole } from '"'"'@\/types\/workspace-types'"'"';/import { \1, WorkspaceRole } from '"'"'@\/types\/workspace'"'"';/g' {} \;
find ./src -name "*.tsx" -exec sed -i '' 's/import { \(.*\), WorkspaceRole } from '"'"'@\/types\/workspace-types'"'"';/import { \1, WorkspaceRole } from '"'"'@\/types\/workspace'"'"';/g' {} \;

echo "Updated all WorkspaceRole imports to use the new workspace folder structure"
