#!/bin/bash

# Fix imports for form types that are incorrectly imported from @/types/block
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { ApiForm, ApiFormStatus } from '"'"'@\/types\/block'"'"';/import { ApiForm, ApiFormStatus } from '"'"'@\/types\/form'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { UiForm, UiFormListItem } from '"'"'@\/types\/block'"'"';/import { UiForm, UiFormListItem } from '"'"'@\/types\/form'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { ApiFormVersion, UiFormVersion } from '"'"'@\/types\/block'"'"';/import { ApiFormVersion, UiFormVersion } from '"'"'@\/types\/form'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { DbFormVersion, ApiFormVersion } from '"'"'@\/types\/block'"'"';/import { DbFormVersion, ApiFormVersion } from '"'"'@\/types\/form'"'"';/g'

# Fix imports for old form types that should be using the barrel files
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { FormBlock as/import { UiBlock as/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { DbBlock,/import { UiBlock,/g'

# Fix references to old type in form-builder-content.tsx
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/FormBlock\[\]/UiBlock\[\]/g'
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/FormBlock>/UiBlock>/g'
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/FormBlock[^a-zA-Z0-9_]]/UiBlock]/g'

# Fix any remaining blockTypeId references to use subtype instead
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/block.blockTypeId/block.subtype/g'
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/currentBlock.blockTypeId/currentBlock.subtype/g'
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/\.blockTypeId/\.subtype/g'

# Replace QA question/answer format with ApiQAPair type properties
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/question:/type: "question", content:/g'
find /Users/victorli/Desktop/Flowform/src/components/form/builder/form-builder-content.tsx -type f | xargs sed -i '' 's/answer:/type: "answer", content:/g'

echo "Type import fixes completed!"
