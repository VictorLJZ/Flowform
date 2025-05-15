#!/bin/bash

# Fix property naming in code - convert snake_case to camelCase
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.order_index/\.orderIndex/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.system_prompt/\.systemPrompt/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.max_tokens/\.maxTokens/g' 
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.starter_questions/\.starterQuestions/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.reference_materials/\.referenceMaterials/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.starter_question/\.starterQuestion/g'

# Fix question/answer property naming in ApiQAPair
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/question:/type: "question", content:/g'
find /Users/victorli/Desktop/Flowform/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/answer:/type: "answer", content:/g'

echo "Property name fixes completed!"
