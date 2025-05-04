#!/bin/bash

# Check if function name is provided
if [ "$1" == "" ]; then
  echo "Please provide a function name to deploy"
  echo "Usage: ./deploy.sh <function-name>"
  exit 1
fi

FUNCTION_NAME=$1

# Navigate to the function directory
if [ ! -d "$FUNCTION_NAME" ]; then
  echo "Error: Function '$FUNCTION_NAME' not found"
  exit 1
fi

# Move to the project root to deploy
cd ../../../..

# Deploy the function
echo "Deploying function: $FUNCTION_NAME"
supabase functions deploy $FUNCTION_NAME

echo "Deployment complete"
