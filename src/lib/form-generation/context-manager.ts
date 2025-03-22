import { ConversationContext } from '../../types/form-generation';

export class ContextManager {
  private context: ConversationContext;
  
  constructor(starterQuestion: string) {
    this.context = {
      questions: [starterQuestion],
      answers: [],
      currentQuestionIndex: 0
    };
  }
  
  getCurrentQuestion(): string {
    return this.context.questions[this.context.currentQuestionIndex];
  }
  
  addAnswer(answer: string): void {
    this.context.answers.push(answer);
  }
  
  addQuestion(question: string): void {
    this.context.questions.push(question);
    this.context.currentQuestionIndex++;
  }
  
  getConversationHistory(): { questions: string[], answers: string[] } {
    return {
      questions: this.context.questions,
      answers: this.context.answers
    };
  }
  
  getCurrentIndex(): number {
    return this.context.currentQuestionIndex;
  }
  
  isComplete(maxQuestions: number): boolean {
    return this.context.currentQuestionIndex >= maxQuestions - 1;
  }
  
  incrementIndex(): void {
    if (this.context.currentQuestionIndex < this.context.questions.length - 1) {
      this.context.currentQuestionIndex++;
    }
  }
} 