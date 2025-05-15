#!/bin/bash

# Fix FormBlock imports
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { FormBlock } from '"'"'@\/types\/block-types'"'"';/import { UiBlock } from '"'"'@\/types\/block'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import type { FormBlock } from '"'"'@\/types\/block-types'"'"';/import type { UiBlock } from '"'"'@\/types\/block'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { FormBlock as FrontendFormBlock } from '"'"'@\/types\/block-types'"'"';/import { UiBlock as FrontendFormBlock } from '"'"'@\/types\/block'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import type { FormBlock as FrontendFormBlock } from '"'"'@\/types\/block-types'"'"';/import type { UiBlock as FrontendFormBlock } from '"'"'@\/types\/block'"'"';/g'

# Fix BlockType imports
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { BlockType } from '"'"'@\/types\/block-types'"'"';/import { ApiBlockType } from '"'"'@\/types\/block\/ApiBlock'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import type { BlockType } from '"'"'@\/types\/block-types'"'"';/import type { ApiBlockType } from '"'"'@\/types\/block\/ApiBlock'"'"';/g'

# Fix combined FormBlock and BlockType imports
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { FormBlock, BlockType } from '"'"'@\/types\/block-types'"'"';/import { UiBlock } from '"'"'@\/types\/block'"'"';\nimport { ApiBlockType } from '"'"'@\/types\/block\/ApiBlock'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import type { FormBlock, BlockType } from '"'"'@\/types\/block-types'"'"';/import type { UiBlock } from '"'"'@\/types\/block'"'"';\nimport type { ApiBlockType } from '"'"'@\/types\/block\/ApiBlock'"'"';/g'

# Fix BlockDefinition imports
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import type { BlockDefinition } from '"'"'@\/types\/block-types'"'"';/import { BlockDefinition } from '"'"'@\/registry\/blockRegistry'"'"';/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import { BlockDefinition } from '"'"'@\/types\/block-types'"'"';/import { BlockDefinition } from '"'"'@\/registry\/blockRegistry'"'"';/g'

# Fix combined FormBlock and BlockDefinition imports
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/import type { FormBlock, BlockDefinition } from '"'"'@\/types\/block-types'"'"'/import type { UiBlock } from '"'"'@\/types\/block'"'"';\nimport { BlockDefinition } from '"'"'@\/registry\/blockRegistry'"'"'/g'

# Fix references to FormBlock type
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/FormBlock\[\]/UiBlock\[\]/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/FormBlock /UiBlock /g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/FormBlock;/UiBlock;/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/FormBlock\>/UiBlock\>/g'

# Fix references to BlockType
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/BlockType /ApiBlockType /g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/BlockType;/ApiBlockType;/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/BlockType\>/ApiBlockType\>/g'

# Fix property name: blockTypeId → subtype
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/block\.blockTypeId/block\.subtype/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.blockTypeId/\.subtype/g'

echo "Import fixes completed!"
