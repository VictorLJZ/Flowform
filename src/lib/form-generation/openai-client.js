"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var openai_1 = require("openai");
// Initialize the OpenAI client
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || '',
});
exports.default = openai;
