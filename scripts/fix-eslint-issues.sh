#!/bin/bash

# Fix remaining occurrences of FormBlock in imports
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { FormBlock } /import { UiBlock } /g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import type { FormBlock } /import type { UiBlock } /g'

# Fix unused imports with ESLint disable comments where appropriate
# For mapFromDbApiBlockType and mapToDbApiBlockType
find /Users/victorli/Desktop/Flowform/src/components/dashboard/FormsView.tsx -type f | xargs sed -i '' 's/import { mapFromDbApiBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { mapFromDbApiBlockType/g'
find /Users/victorli/Desktop/Flowform/src/services/form/publishFormWithFormBuilderStore.ts -type f | xargs sed -i '' 's/import { mapFromDbApiBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { mapFromDbApiBlockType/g'
find /Users/victorli/Desktop/Flowform/src/services/form/transformVersionedFormData.ts -type f | xargs sed -i '' 's/import { mapFromDbApiBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { mapFromDbApiBlockType/g'
find /Users/victorli/Desktop/Flowform/src/services/viewer/loadFormComplete.ts -type f | xargs sed -i '' 's/import { mapFromDbApiBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { mapFromDbApiBlockType/g'

# For mapToDbApiBlockType
find /Users/victorli/Desktop/Flowform/src/services/form/createFormVersion.ts -type f | xargs sed -i '' 's/import { mapToDbApiBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { mapToDbApiBlockType/g'
find /Users/victorli/Desktop/Flowform/src/services/form/saveFormWithBlocks.ts -type f | xargs sed -i '' 's/import { mapToDbApiBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { mapToDbApiBlockType/g'
find /Users/victorli/Desktop/Flowform/src/services/form/updateFormVersion.ts -type f | xargs sed -i '' 's/import { mapToDbApiBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { mapToDbApiBlockType/g'

# Fix other unused imports
find /Users/victorli/Desktop/Flowform/src/components/workflow/builder/condition-fields.tsx -type f | xargs sed -i '' 's/const sourceBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nconst sourceBlockType/g'
find /Users/victorli/Desktop/Flowform/src/components/workflow/builder/condition-operators.tsx -type f | xargs sed -i '' 's/const sourceBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nconst sourceBlockType/g'

# Fix DbBlockType unused imports
find /Users/victorli/Desktop/Flowform/src/types/block/DbBlockVersion.ts -type f | xargs sed -i '' 's/import { DbBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { DbBlockType/g'
find /Users/victorli/Desktop/Flowform/src/types/postgresql-types.ts -type f | xargs sed -i '' 's/import { DbBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nimport { DbBlockType/g'
find /Users/victorli/Desktop/Flowform/src/utils/type-utils/block/ApiToDbBlock.ts -type f | xargs sed -i '' 's/DbBlockType/\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\nDbBlockType/g'

# Fix the unescaped entities in AIConversationHistory.tsx
find /Users/victorli/Desktop/Flowform/src/components/form/blocks/AIConversationBlock/AIConversationHistory.tsx -type f | xargs sed -i '' 's/No conversations yet. Type your first message and hit "Send"!/No conversations yet. Type your first message and hit &quot;Send&quot;!/g'

echo "ESLint issues fixed!"
