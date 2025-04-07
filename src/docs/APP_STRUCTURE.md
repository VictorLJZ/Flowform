# FlowForm-neo App Structure

This document outlines the core functionality and user interaction flow for the FlowForm-neo application.

## User Interaction Flow

### Workspace Management
- Users start with one default workspace
- Users can create multiple workspaces for different projects or teams
- Users can invite collaborators to join their workspaces
- Each workspace has its own dashboard with overview statistics and information

### Dashboard Experience
- Main dashboard provides analytics and overview information
- Access to form creation, management, and response data
- User and team management within the workspace

### Form Building Experience
- The form builder opens in a dashboard page without the app sidebar
- Interactive builder mimics Typeform's builder experience
- Drag-and-drop interface for adding and arranging question blocks
- Real-time preview of the form as it's being built
- Settings panel for form-wide configurations

## Question Block Types

### Static Blocks
Static blocks are predetermined questions with fixed formats:

- **Short Text**: For brief text responses (names, short answers)
- **Long Text**: For extended text responses (comments, opinions)
- **Email**: For collecting email addresses with validation
- **Date**: For collecting date information
- **Multiple Choice**: For selecting options from a predefined list
- **Number**: For numerical inputs
- **Scale**: For rating scales
- **Yes/No**: For binary choices

Each static block has configuration options for:
- Question text
- Help text/description
- Required/optional status
- Input validation rules

### Dynamic Blocks
Dynamic blocks leverage AI to create conversational experiences:

- **Configuration Parameters**:
  - Starter question: Initial question to begin the conversation
  - AI temperature setting: Controls randomness/creativity of AI responses
  - Maximum number of questions: Limits the depth of the conversation
  - AI prompt instructions: Guidelines for the AI to follow when generating questions

- **Flow Process**:
  1. User sees the starter question and provides a response
  2. Based on this response, the AI generates a contextual follow-up question
  3. This process continues, with each response informing the next question
  4. The conversation stops when the maximum question limit is reached

- **Use Cases**:
  - Customer feedback that adapts based on sentiment
  - Product research that explores specific features based on interest
  - Educational assessments that adapt to student knowledge level
  - Technical support that narrows down issues through progressive questioning

## Form Response Flow

1. End users access forms through a public URL
2. They navigate through questions sequentially
3. For dynamic blocks, they experience a conversational flow
4. Responses are saved as they progress through the form
5. After completion, they see a customizable thank you screen
6. Form creators can view, analyze, and export responses through the dashboard

## Collaboration Features

- Team members can be invited with different permission levels
- Multiple users can work on form design simultaneously
- Shared access to response data with appropriate permissions
- Activity tracking for team collaboration

## Analytics and Insights

- Response rate tracking
- Completion time analysis
- Dropout point identification
- Question-specific analytics
- Response trend visualization
- Export capabilities for further analysis
