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
console.log('Script started');
var question_generator_1 = require("./question-generator");
var dotenv_1 = require("dotenv");
console.log('Imports completed');
// Load environment variables
dotenv_1.default.config();
console.log('Environment loaded');
// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
}
function testFormGeneration() {
    return __awaiter(this, void 0, void 0, function () {
        var config, generator, answers, i, result, error_1, state, i, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('=== FORM GENERATION TEST ===\n');
                    config = {
                        starterQuestion: "What's your favorite hobby and why do you enjoy it?",
                        instructions: "Create a conversational form that explores the person's interests and hobbies in depth. Ask follow-up questions that help understand their motivations and experiences.",
                        temperature: 0.7,
                        maxQuestions: 5
                    };
                    console.log('Form Configuration:');
                    console.log('- Starter Question:', config.starterQuestion);
                    console.log('- Max Questions:', config.maxQuestions);
                    console.log('- Temperature:', config.temperature);
                    console.log('\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    generator = new question_generator_1.QuestionGenerator(config);
                    // Get the starter question
                    console.log('=== STARTER QUESTION ===');
                    console.log(generator.getStarterQuestion());
                    console.log('\n');
                    answers = [
                        "I love hiking because it allows me to connect with nature and clear my mind.",
                        "I usually hike in the mountains near my home, but I've also done some trails in national parks.",
                        "My most memorable hike was in Yosemite last summer. The views were breathtaking.",
                        "I typically go hiking once or twice a month, depending on the weather and my schedule."
                    ];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < answers.length)) return [3 /*break*/, 7];
                    console.log("=== INTERACTION ".concat(i + 1, " ==="));
                    console.log('User Answer:', answers[i]);
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, generator.generateNextQuestion(answers[i])];
                case 4:
                    result = _a.sent();
                    console.log('Generated Question:', result.question);
                    console.log('Is Last Question:', result.isLastQuestion);
                    console.log('\n');
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error generating question after answer ".concat(i + 1, ":"), error_1);
                    console.log('\n');
                    return [3 /*break*/, 6];
                case 6:
                    i++;
                    return [3 /*break*/, 2];
                case 7:
                    // Print the final conversation state
                    console.log('=== FINAL CONVERSATION STATE ===');
                    state = generator.getConversationState();
                    console.log('Questions:', state.questions.length);
                    console.log('Answers:', state.answers.length);
                    console.log('Current Index:', state.currentIndex);
                    console.log('\nFull Conversation:');
                    for (i = 0; i < state.questions.length; i++) {
                        console.log("Q".concat(i + 1, ": ").concat(state.questions[i]));
                        if (i < state.answers.length) {
                            console.log("A".concat(i + 1, ": ").concat(state.answers[i]));
                        }
                    }
                    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    console.error('Test failed with error:', error_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testFormGeneration();
