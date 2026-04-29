import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenRouter } from "@langchain/openrouter";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";


// ═══════════════════════════════════════════
// MODEL REGISTRY
// ═══════════════════════════════════════════

export const MODELS = [
    {
        id: "gemini-flash",
        name: "Gemini Flash",
        provider: "google",
        description: "Google's fast & capable model",
        badge: "⚡ Fast",
    },
    {
        id: "mistral",
        name: "Mistral",
        provider: "mistral",
        description: "Mistral AI's efficient model",
        badge: "⚡ Fast",
    },
    {
        id: "llama-3.3-70b",
        name: "Llama 3.3 70B",
        provider: "openrouter",
        description: "Meta's powerful 70B model via OpenRouter",
        badge: "🆓 Free",
    },
    {
        id: "gemma-4",
        name: "Gemma 4 31B",
        provider: "openrouter",
        description: "Google's latest open model via OpenRouter",
        badge: "🆓 Free",
    },
    {
        id: "qwen-3",
        name: "Qwen 3 80B",
        provider: "openrouter",
        description: "Alibaba's powerful reasoning model",
        badge: "🧠 Smart",
    },
];


// ═══════════════════════════════════════════
// MODEL FACTORY
// ═══════════════════════════════════════════

function getModel(modelId) {
    switch (modelId) {
        case "gemini-flash":
            return new ChatGoogleGenerativeAI({
                model: "gemini-2.0-flash",
                apiKey: process.env.GEMINI_API_KEY,
            });

        case "mistral":
            return new ChatMistralAI({
                model: "mistral-small-latest",
                apiKey: process.env.MISTRAL_API_KEY,
            });

        case "llama-3.3-70b":
            return new ChatOpenRouter({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                apiKey: process.env.OPENROUTER_API_KEY,
            });

        case "gemma-4":
            return new ChatOpenRouter({
                model: "google/gemma-4-31b-it:free",
                apiKey: process.env.OPENROUTER_API_KEY,
            });

        case "qwen-3":
            return new ChatOpenRouter({
                model: "qwen/qwen3-next-80b-a3b-instruct:free",
                apiKey: process.env.OPENROUTER_API_KEY,
            });

        default:
            // Fallback to Mistral (reliable)
            return new ChatMistralAI({
                model: "mistral-small-latest",
                apiKey: process.env.MISTRAL_API_KEY,
            });
    }
}


// ═══════════════════════════════════════════
// SEARCH TOOL
// ═══════════════════════════════════════════

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
);


// ═══════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════

const SYSTEM_PROMPT = `You are a helpful and precise assistant for answering questions.
If you don't know the answer, say you don't know. 
If the question requires up-to-date information and you have access to a search tool, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
Always provide clear, well-structured answers.`;

const SYSTEM_PROMPT_NO_SEARCH = `You are a helpful and precise assistant for answering questions.
If you don't know the answer, say you don't know.
Answer based on your training knowledge only.
Always provide clear, well-structured answers.`;


// ═══════════════════════════════════════════
// FORMAT MESSAGES HELPER
// ═══════════════════════════════════════════

function formatMessages(messages, useWebSearch) {
    return [
        new SystemMessage(useWebSearch ? SYSTEM_PROMPT : SYSTEM_PROMPT_NO_SEARCH),
        ...(messages.map(msg => {
            if (msg.role === "user") return new HumanMessage(msg.content);
            if (msg.role === "ai") return new AIMessage(msg.content);
        }).filter(Boolean))
    ];
}


// ═══════════════════════════════════════════
// STREAMING RESPONSE (SSE — async generator)
// ═══════════════════════════════════════════

export async function* generateResponseStream(messages, options = {}) {
    const { modelId = "gemini-flash", useWebSearch = true } = options;
    const model = getModel(modelId);
    const formattedMessages = formatMessages(messages, useWebSearch);

    try {
        if (useWebSearch) {
            // Step 1: Check if the model wants to call a search tool
            const modelWithTools = model.bindTools([searchInternetTool]);
            const response = await modelWithTools.invoke(formattedMessages);

            if (response.tool_calls && response.tool_calls.length > 0) {
                // Signal that we're searching
                yield { type: "searching" };

                const toolCall = response.tool_calls[0];
                const toolResult = await searchInternet({ query: toolCall.args.query });

                const followUp = [
                    ...formattedMessages,
                    response,
                    new HumanMessage(`Here are the search results:\n${toolResult}\n\nPlease provide a comprehensive answer based on these results.`)
                ];

                // Step 2: Stream the final answer with search context
                const stream = await model.stream(followUp);
                for await (const chunk of stream) {
                    if (chunk.content) {
                        yield { type: "token", content: chunk.content };
                    }
                }
                return;
            }

            // Model didn't want to search — yield the response directly
            if (response.content) {
                yield { type: "token", content: response.content };
            }
            return;
        }

        // No web search — stream directly
        const stream = await model.stream(formattedMessages);
        for await (const chunk of stream) {
            if (chunk.content) {
                yield { type: "token", content: chunk.content };
            }
        }

    } catch (error) {
        console.error(`Streaming error with model ${modelId}:`, error.message);

        // Fallback: try without tools/streaming
        if (useWebSearch) {
            try {
                const response = await model.invoke(formattedMessages);
                if (response.content) {
                    yield { type: "token", content: response.content };
                }
                return;
            } catch (fallbackError) {
                console.error(`Fallback also failed:`, fallbackError.message);
                throw fallbackError;
            }
        }
        throw error;
    }
}


// ═══════════════════════════════════════════
// NON-STREAMING RESPONSE (kept for backward compat)
// ═══════════════════════════════════════════

export async function generateResponse(messages, options = {}) {
    const { modelId = "gemini-flash", useWebSearch = true } = options;

    const model = getModel(modelId);
    const formattedMessages = formatMessages(messages, useWebSearch);

    try {
        if (useWebSearch) {
            const modelWithTools = model.bindTools([searchInternetTool]);
            const response = await modelWithTools.invoke(formattedMessages);

            if (response.tool_calls && response.tool_calls.length > 0) {
                const toolCall = response.tool_calls[0];
                const toolResult = await searchInternet({ query: toolCall.args.query });

                const followUp = [
                    ...formattedMessages,
                    response,
                    new HumanMessage(`Here are the search results:\n${toolResult}\n\nPlease provide a comprehensive answer based on these results.`)
                ];

                const finalResponse = await model.invoke(followUp);
                return finalResponse.content || finalResponse.text;
            }

            return response.content || response.text;
        } else {
            const response = await model.invoke(formattedMessages);
            return response.content || response.text;
        }
    } catch (error) {
        console.error(`Error with model ${modelId}:`, error.message);

        if (useWebSearch) {
            try {
                const response = await model.invoke(formattedMessages);
                return response.content || response.text;
            } catch (fallbackError) {
                console.error(`Fallback also failed:`, fallbackError.message);
                throw fallbackError;
            }
        }
        throw error;
    }
}


// ═══════════════════════════════════════════
// GENERATE CHAT TITLE (always uses Gemini — fast & cheap)
// ═══════════════════════════════════════════

export async function generateChatTitle(message) {
    const titlePrompt = [
        new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging. Reply with ONLY the title, nothing else.`),
        new HumanMessage(`Generate a title for: "${message}"`)
    ];

    // Try Gemini first (fast & cheap)
    try {
        const gemini = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            apiKey: process.env.GEMINI_API_KEY,
        });
        const response = await gemini.invoke(titlePrompt);
        return response.content || response.text;
    } catch (err) {
        console.error("Gemini title generation failed, trying Mistral:", err.message);
    }

    // Fallback to Mistral
    try {
        const mistral = new ChatMistralAI({
            model: "mistral-small-latest",
            apiKey: process.env.MISTRAL_API_KEY,
        });
        const response = await mistral.invoke(titlePrompt);
        return response.content || response.text;
    } catch (err) {
        console.error("Mistral title generation also failed:", err.message);
    }

    // Last resort: truncate the message
    return message.length > 40 ? message.substring(0, 37) + "..." : message;
}
