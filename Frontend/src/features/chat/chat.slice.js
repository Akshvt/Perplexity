import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        isSearching: false,
        error: null,
        selectedModel: 'mistral',
        useWebSearch: true,
        availableModels: [],
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[ chatId ] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload
            state.chats[ chatId ].messages.push({ content, role })
        },
        /** Append a token to the last AI message (for SSE streaming) */
        appendToLastMessage: (state, action) => {
            const { chatId, content } = action.payload
            const messages = state.chats[ chatId ]?.messages
            if (!messages) return
            const lastMsg = messages[ messages.length - 1 ]
            if (lastMsg && lastMsg.role === "ai") {
                lastMsg.content += content
            }
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            state.chats[ chatId ].messages.push(...messages)
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setSearching: (state, action) => {
            state.isSearching = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setSelectedModel: (state, action) => {
            state.selectedModel = action.payload
        },
        setUseWebSearch: (state, action) => {
            state.useWebSearch = action.payload
        },
        setAvailableModels: (state, action) => {
            state.availableModels = action.payload
        },
    }
})

export const {
    setChats, setCurrentChatId, setLoading, setSearching, setError,
    createNewChat, addNewMessage, appendToLastMessage, addMessages,
    setSelectedModel, setUseWebSearch, setAvailableModels
} = chatSlice.actions

export default chatSlice.reducer
