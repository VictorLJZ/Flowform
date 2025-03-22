"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConversationHistory = exports.questionGenerationPrompt = void 0;
exports.questionGenerationPrompt = "\nYou are an intelligent form generation assistant. Your task is to generate thoughtful follow-up questions based on previous questions and answers.\n\nFORM INSTRUCTIONS:\n{{instructions}}\n\nCONVERSATION HISTORY:\n{{conversationHistory}}\n\nGUIDELINES:\n1. Generate a single follow-up question that naturally continues the conversation\n2. Make questions open-ended to encourage detailed responses\n3. Avoid repeating topics already covered\n4. Keep questions relevant to the overall form purpose\n5. Be conversational and friendly in tone\n6. If this is the final question (question #{{currentIndex}} of {{maxQuestions}}), make it a concluding question\n\nGenerate the next question:\n";
var formatConversationHistory = function (questions, answers) {
    var history = '';
    for (var i = 0; i < questions.length; i++) {
        history += "Question ".concat(i + 1, ": ").concat(questions[i], "\n");
        if (i < answers.length) {
            history += "Answer ".concat(i + 1, ": ").concat(answers[i], "\n\n");
        }
    }
    return history;
};
exports.formatConversationHistory = formatConversationHistory;
