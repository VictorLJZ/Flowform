# FlowForm - AI-Powered Conversational Forms

FlowForm is a dynamic form application that utilizes AI to create personalized question paths for each respondent. Instead of static forms, FlowForm starts with a configurable "Starter Question" and uses LLM-generated follow-up questions based on individual responses.

## Project Overview

Traditional forms follow a rigid, one-size-fits-all approach that often fails to capture the depth and nuance of human experiences. FlowForm transforms this experience by creating adaptive conversations that feel more natural and yield richer insights.

## Key Features

- **Dynamic Question Generation**: AI creates personalized follow-up questions based on previous answers
- **Form Configuration Dashboard**: Configure starter questions, adjust AI parameters, and provide custom instructions
- **Distraction-Free Response Interface**: Clean UI focused on the conversation experience
- **RAG-Powered Analytics**: Natural language interface to query form data and extract insights

## Inspiration

Our team identified a significant limitation in traditional survey tools: their rigid, linear structure fails to capture the nuanced nature of human experiences. Standard forms follow predetermined paths regardless of individual responses, resulting in missed opportunities for deeper insights and engagement.

During user research sessions, we consistently observed how valuable it would be to dynamically adapt questions based on each participant's unique responses. With recent advancements in large language models, particularly GPT-4o, we recognized an opportunity to transform the form experience into something more conversational, intuitive, and insightful.

## What it does

FlowForm revolutionizes data collection by creating personalized question paths for each respondent. Unlike conventional forms with fixed questions, FlowForm begins with a configurable "Starter Question" and leverages AI to generate contextually relevant follow-up questions based on individual responses.

The result is a form experience that feels more like a meaningful conversation than a mechanical questionnaire, leading to richer data and more engaged respondents.

## How it works

FlowForm uses OpenAI's GPT-4o-mini model through the Responses API to generate contextually relevant follow-up questions. The system maintains conversation context to ensure a coherent flow of questions, and embeds Q&A pairs as vectors for later analysis.

The RAG (Retrieval-Augmented Generation) system allows you to query your form data using natural language, retrieving relevant responses and generating insights based on the collected data.

## How we built it

We developed FlowForm using a modern, scalable architecture:

1. **Frontend**: 
   - Next.js 15 with React 19 for a responsive, component-based UI
   - ShadCN UI components with Tailwind CSS v4 for consistent styling
   - Zustand for efficient state management
   - Responsive design principles for cross-device compatibility

2. **Backend**:
   - Serverless API routes with Next.js
   - Supabase for database and authentication services
   - OpenAI Responses API with GPT-4o-mini for question generation
   - Vector embeddings for the RAG analytics system

3. **Form Generation System**:
   - Sophisticated prompt engineering for contextually appropriate questions
   - Conversation context management for coherent question flow
   - Optimized state handling for seamless user experience

Our architecture implements a hybrid approach where form configuration occurs server-side, while form interaction utilizes client components for responsiveness. The RAG system embeds all question-answer pairs as vectors, enabling natural language querying of form data.

## Technology Stack

- **Frontend**: Next.js 15, React 19, ShadCN UI, Tailwind CSS v4, Zustand
- **Backend**: Next.js API routes, Supabase, OpenAI Responses API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/flowform.git
   cd flowform
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```
   # Create a .env.local file with the following variables
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Project Structure

```
/src
  /app                 # Next.js app router pages
    /api               # API routes
    /dashboard         # Dashboard pages
    /f                 # Form session pages
  /components          # Reusable UI components
  /lib                 # Utility functions and services
    /form-generation   # Form generation logic
  /stores              # Zustand state stores
  /types               # TypeScript type definitions
```

## What's next for FlowForm

Our roadmap for FlowForm includes several strategic enhancements:

1. **Industry-Specific Templates**: Develop pre-configured templates for common use cases across various sectors.

2. **Enhanced Analytics**: Expand the RAG system with visualization tools and automated insight generation.

3. **Multi-modal Response Support**: Implement capabilities for image, audio, and video responses.

4. **Integration Ecosystem**: Build connectors for popular productivity and CRM platforms.

5. **Enterprise Features**: Develop team collaboration tools, advanced permissions, and compliance features.

6. **Mobile Applications**: Create native mobile experiences for iOS and Android platforms.

FlowForm represents a fundamental shift in data collection methodology—creating adaptive forms that respond to humans, rather than requiring humans to adapt to forms.
