"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
var ContextManager = /** @class */ (function () {
    function ContextManager(starterQuestion) {
        this.context = {
            questions: [starterQuestion],
            answers: [],
            currentQuestionIndex: 0
        };
    }
    ContextManager.prototype.getCurrentQuestion = function () {
        return this.context.questions[this.context.currentQuestionIndex];
    };
    ContextManager.prototype.addAnswer = function (answer) {
        this.context.answers.push(answer);
    };
    ContextManager.prototype.addQuestion = function (question) {
        this.context.questions.push(question);
        this.context.currentQuestionIndex++;
    };
    ContextManager.prototype.getConversationHistory = function () {
        return {
            questions: this.context.questions,
            answers: this.context.answers
        };
    };
    ContextManager.prototype.getCurrentIndex = function () {
        return this.context.currentQuestionIndex;
    };
    ContextManager.prototype.isComplete = function (maxQuestions) {
        return this.context.currentQuestionIndex >= maxQuestions - 1;
    };
    return ContextManager;
}());
exports.ContextManager = ContextManager;
