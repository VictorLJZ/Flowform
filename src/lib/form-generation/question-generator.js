"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionGenerator = void 0;
var openai_client_1 = require("./openai-client");
var context_manager_1 = require("./context-manager");
var prompt_templates_1 = require("./prompt-templates");
var QuestionGenerator = /** @class */ (function () {
    function QuestionGenerator(config) {
        this.config = config;
        this.contextManager = new context_manager_1.ContextManager(config.starterQuestion);
    }
    QuestionGenerator.prototype.getStarterQuestion = function () {
        return this.config.starterQuestion;
    };
    QuestionGenerator.prototype.generateNextQuestion = function (answer) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, questions, answers, conversationHistory, currentIndex, prompt, input, requestOptions, response, generatedQuestion, isLastQuestion;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Add the user's answer to the context
                        this.contextManager.addAnswer(answer);
                        // Check if we've reached the maximum number of questions
                        if (this.contextManager.isComplete(this.config.maxQuestions)) {
                            return [2 /*return*/, {
                                    question: "Thank you for your responses! Is there anything else you'd like to add before we conclude?",
                                    isLastQuestion: true
                                }];
                        }
                        _a = this.contextManager.getConversationHistory(), questions = _a.questions, answers = _a.answers;
                        conversationHistory = (0, prompt_templates_1.formatConversationHistory)(questions, answers);
                        currentIndex = this.contextManager.getCurrentIndex() + 1;
                        prompt = prompt_templates_1.questionGenerationPrompt
                            .replace('{{instructions}}', this.config.instructions)
                            .replace('{{conversationHistory}}', conversationHistory)
                            .replace('{{currentIndex}}', currentIndex.toString())
                            .replace('{{maxQuestions}}', this.config.maxQuestions.toString());
                        input = [
                            { role: "developer", content: "You are a form question generator that creates thoughtful follow-up questions based on previous responses." },
                            { role: "user", content: prompt }
                        ];
                        requestOptions = {
                            model: "gpt-4o-mini",
                            input: input,
                            temperature: this.config.temperature,
                        };
                        if (this.previousResponseId) {
                            requestOptions.previous_response_id = this.previousResponseId;
                        }
                        else {
                            requestOptions.store = true; // Enable state management for the first request
                        }
                        return [4 /*yield*/, openai_client_1.default.responses.create(requestOptions)];
                    case 1:
                        response = _b.sent();
                        // Store the response ID for future requests
                        this.previousResponseId = response.id;
                        generatedQuestion = response.output_text;
                        // Add the new question to the context
                        this.contextManager.addQuestion(generatedQuestion);
                        isLastQuestion = this.contextManager.getCurrentIndex() >= this.config.maxQuestions - 1;
                        return [2 /*return*/, {
                                question: generatedQuestion,
                                isLastQuestion: isLastQuestion
                            }];
                }
            });
        });
    };
    // Get the current conversation state
    QuestionGenerator.prototype.getConversationState = function () {
        return {
            questions: this.contextManager.getConversationHistory().questions,
            answers: this.contextManager.getConversationHistory().answers,
            currentIndex: this.contextManager.getCurrentIndex()
        };
    };
    return QuestionGenerator;
}());
exports.QuestionGenerator = QuestionGenerator;
