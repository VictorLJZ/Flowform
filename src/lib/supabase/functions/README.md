# Supabase Edge Functions

This directory contains Edge Functions that run on Supabase's infrastructure.

## Deployment Instructions

To deploy these functions to your Supabase project:

1. Navigate to the specific function directory
2. Ensure you have Supabase CLI installed and configured
3. Run the deployment command

Example:

```bash
# Navigate to the function directory
cd src/lib/supabase/functions/send-email

# Deploy the function
supabase functions deploy send-email
```

## Available Functions

### send-email

A secure email sending service that integrates with your SMTP provider. This function authenticates users before allowing email sending and provides a consistent interface for all email operations in the application.

Required environment variables (set in Supabase dashboard):
- `SMTP_HOST`: Your SMTP server hostname
- `SMTP_PORT`: SMTP port (typically 587 for TLS)
- `SMTP_USERNAME`: Your SMTP username/account
- `SMTP_PASSWORD`: Your SMTP password
- `SENDER_EMAIL`: The "from" email address
- `SENDER_NAME`: The display name for the sender
