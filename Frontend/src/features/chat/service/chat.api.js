import axios from "axios";

const api = axios.create({
    baseURL: "",
    withCredentials: true,
})


/**
 * Send a message and stream AI response via SSE.
 * Uses fetch instead of axios because axios doesn't support ReadableStream.
 * @param {Object} params - message, chatId, modelId, useWebSearch
 * @param {Object} callbacks - { onChatCreated, onSearching, onToken, onDone, onError }
 */
export const sendMessageStream = async ({ message, chatId, modelId, useWebSearch }, callbacks) => {
    const response = await fetch("/api/chats/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, chat: chatId, modelId, useWebSearch }),
    });

    if (!response.ok) {
        throw new Error("Failed to send message");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // keep incomplete chunk in buffer

        for (const line of lines) {
            if (line.startsWith("data: ")) {
                try {
                    const data = JSON.parse(line.slice(6));
                    callbacks.onEvent(data);
                } catch {
                    // skip malformed JSON
                }
            }
        }
    }
}


export const getChats = async () => {
    const response = await api.get("/api/chats")
    return response.data
}

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`)
    return response.data
}

export const getModels = async () => {
    const response = await api.get("/api/chats/models")
    return response.data
}
