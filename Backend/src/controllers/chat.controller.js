import { generateResponseStream, generateChatTitle, MODELS } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";


/**
 * @desc Send a message and stream AI response via SSE
 * @route POST /api/chats/message
 * @access Private
 */
export async function sendMessage(req, res) {
    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
    res.flushHeaders();

    try {
        const { message, chat: chatId, modelId, useWebSearch } = req.body;

        let chat = null;

        // Create new chat if no chatId provided
        if (!chatId) {
            const title = await generateChatTitle(message);
            chat = await chatModel.create({
                user: req.user.id,
                title
            });

            res.write(`data: ${JSON.stringify({ type: "chat_created", chat })}\n\n`);
        }

        const activeChatId = chatId || chat._id;

        // Save user message to DB
        await messageModel.create({
            chat: activeChatId,
            content: message,
            role: "user"
        });

        // Fetch conversation history for context
        const messages = await messageModel.find({ chat: activeChatId });

        // Stream AI response token by token
        let fullContent = "";

        for await (const event of generateResponseStream(messages, {
            modelId: modelId || "mistral",
            useWebSearch: useWebSearch !== undefined ? useWebSearch : true,
        })) {
            if (event.type === "searching") {
                res.write(`data: ${JSON.stringify({ type: "searching" })}\n\n`);
            } else if (event.type === "token") {
                fullContent += event.content;
                res.write(`data: ${JSON.stringify({ type: "token", content: event.content })}\n\n`);
            }
        }

        // Save complete AI message to DB
        const aiMessage = await messageModel.create({
            chat: activeChatId,
            content: fullContent,
            role: "ai"
        });

        res.write(`data: ${JSON.stringify({ type: "done", aiMessage })}\n\n`);
        res.end();

    } catch (error) {
        console.error("SSE stream error:", error.message);
        res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to generate AI response. Please try again." })}\n\n`);
        res.end();
    }
}


export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}


/**
 * @desc Get available AI models
 * @route GET /api/chats/models
 * @access Public
 */
export async function getAvailableModels(req, res) {
    res.status(200).json({
        models: MODELS
    })
}