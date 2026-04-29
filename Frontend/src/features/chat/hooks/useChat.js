import { sendMessageStream, getChats, getMessages, deleteChat, getModels } from "../service/chat.api";
import {
    setChats, setCurrentChatId, setError, setLoading, setSearching,
    createNewChat, addNewMessage, appendToLastMessage, addMessages,
    setAvailableModels
} from "../chat.slice";
import { useDispatch } from "react-redux";


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId, modelId, useWebSearch }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            dispatch(setSearching(false))

            let activeChatId = chatId;
            let aiMessageCreated = false;

            // If existing chat, add user message to UI immediately
            if (chatId) {
                dispatch(addNewMessage({
                    chatId,
                    content: message,
                    role: "user",
                }))
            }

            await sendMessageStream(
                { message, chatId, modelId, useWebSearch },
                {
                    onEvent: (event) => {
                        switch (event.type) {
                            case "chat_created":
                                activeChatId = event.chat._id;
                                dispatch(createNewChat({
                                    chatId: event.chat._id,
                                    title: event.chat.title,
                                }))
                                // Add user message to the new chat
                                dispatch(addNewMessage({
                                    chatId: event.chat._id,
                                    content: message,
                                    role: "user",
                                }))
                                dispatch(setCurrentChatId(event.chat._id))
                                break;

                            case "searching":
                                dispatch(setSearching(true))
                                break;

                            case "token":
                                dispatch(setSearching(false))
                                // Create empty AI message placeholder on first token
                                if (!aiMessageCreated) {
                                    dispatch(addNewMessage({
                                        chatId: activeChatId,
                                        content: "",
                                        role: "ai",
                                    }))
                                    aiMessageCreated = true;
                                }
                                // Append token to the AI message
                                dispatch(appendToLastMessage({
                                    chatId: activeChatId,
                                    content: event.content,
                                }))
                                break;

                            case "done":
                                break;

                            case "error":
                                dispatch(setError(event.message))
                                break;
                        }
                    }
                }
            )
        } catch (err) {
            console.error("Send message failed:", err)
            dispatch(setError(err.message || "Failed to get AI response. Please try again."))
        } finally {
            dispatch(setLoading(false))
            dispatch(setSearching(false))
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[ chat._id ] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId, chats) {
        if (chats[ chatId ]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            // Remove from Redux state
            handleGetChats()
            dispatch(setCurrentChatId(null))
        } catch (err) {
            console.error("Delete chat failed:", err)
        }
    }

    async function handleGetModels() {
        try {
            const data = await getModels()
            dispatch(setAvailableModels(data.models))
        } catch (err) {
            console.error("Failed to fetch models:", err)
        }
    }

    return {
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleGetModels,
    }

}