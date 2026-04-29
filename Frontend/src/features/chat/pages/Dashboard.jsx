import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector, useDispatch } from 'react-redux'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../../auth/hook/useAuth'
import { setSelectedModel, setUseWebSearch, setError } from '../chat.slice'
import remarkGfm from 'remark-gfm'


const Dashboard = () => {
    const chat = useChat()
    const { handleLogout } = useAuth()
    const dispatch = useDispatch()
    const [chatInput, setChatInput] = useState('')
    const [isDark, setIsDark] = useState(false)
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const chats = useSelector((state) => state.chat.chats)
    const currentChatId = useSelector((state) => state.chat.currentChatId)
    const selectedModel = useSelector((state) => state.chat.selectedModel)
    const useWebSearch = useSelector((state) => state.chat.useWebSearch)
    const availableModels = useSelector((state) => state.chat.availableModels)
    const isLoading = useSelector((state) => state.chat.isLoading)
    const isSearching = useSelector((state) => state.chat.isSearching)
    const chatError = useSelector((state) => state.chat.error)
    const user = useSelector((state) => state.auth.user)

    useEffect(() => {
        chat.handleGetChats()
        chat.handleGetModels()
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    }

    const handleSubmitMessage = (event) => {
        event.preventDefault()
        const trimmedMessage = chatInput.trim()
        if (!trimmedMessage || isLoading) return
        chat.handleSendMessage({
            message: trimmedMessage,
            chatId: currentChatId,
            modelId: selectedModel,
            useWebSearch,
        })
        setChatInput('')
    }

    const openChat = (chatId) => {
        chat.handleOpenChat(chatId, chats)
    }

    const currentMessages = chats[currentChatId]?.messages || []
    const activeModel = availableModels.find(m => m.id === selectedModel) || { name: 'Gemini Flash', badge: '⚡ Fast' }

    return (
        <main
            style={{
                background: 'var(--bg)',
                minHeight: '100vh',
                display: 'flex',
                transition: 'background-color 150ms linear'
            }}
        >
            {/* ═══ SIDEBAR ═══ */}
            <aside
                style={{
                    width: '280px',
                    flexShrink: 0,
                    background: 'var(--surface)',
                    borderRight: '2px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                }}
            >
                {/* Logo + Theme Toggle */}
                <div
                    style={{
                        padding: '20px',
                        borderBottom: '2px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="brutal-tag"
                            style={{ fontSize: '14px', padding: '4px 8px', letterSpacing: '0' }}
                        >
                            ■
                        </span>
                        <span
                            className="font-display"
                            style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}
                        >
                            QRUX
                        </span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        data-active={isDark}
                        aria-label="Toggle dark mode"
                        type="button"
                    >
                        <div className="theme-toggle-knob" />
                    </button>
                </div>

                {/* New Chat Button */}
                <div style={{ padding: '16px 20px' }}>
                    <button
                        onClick={() => dispatch({ type: 'chat/setCurrentChatId', payload: null })}
                        className="brutal-btn w-full"
                        style={{ fontSize: '13px', padding: '10px 16px' }}
                        type="button"
                    >
                        + New Search
                    </button>
                </div>

                {/* Section Label */}
                <div style={{ padding: '0 20px 8px' }}>
                    <span
                        className="font-display"
                        style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: 'var(--text-muted)',
                        }}
                    >
                        History
                    </span>
                </div>

                {/* Chat List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                    {Object.values(chats).map((chatItem) => (
                        <button
                            onClick={() => openChat(chatItem.id)}
                            key={chatItem.id}
                            type="button"
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '10px 12px',
                                marginBottom: '4px',
                                border: currentChatId === chatItem.id
                                    ? '2px solid var(--border)'
                                    : '2px solid transparent',
                                background: currentChatId === chatItem.id
                                    ? 'var(--accent)'
                                    : 'transparent',
                                color: currentChatId === chatItem.id
                                    ? '#0D0D0D'
                                    : 'var(--text)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'background 60ms linear, border-color 60ms linear',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                if (currentChatId !== chatItem.id) {
                                    e.target.style.background = 'var(--surface-alt)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentChatId !== chatItem.id) {
                                    e.target.style.background = 'transparent'
                                }
                            }}
                        >
                            {chatItem.title}
                        </button>
                    ))}
                </div>

                {/* ═══ USER PROFILE + LOGOUT ═══ */}
                <div
                    style={{
                        padding: '16px 20px',
                        borderTop: '2px solid var(--border)',
                        background: 'var(--surface)',
                    }}
                >
                    <div style={{ marginBottom: '12px' }}>
                        <span
                            className="font-display"
                            style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--text)',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {user?.username || 'User'}
                        </span>
                        <span
                            className="font-mono"
                            style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {user?.email || ''}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        type="button"
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'transparent',
                            border: '2px solid var(--border)',
                            color: 'var(--text)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'background 60ms linear, color 60ms linear',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#FF4444'
                            e.target.style.color = '#FFF'
                            e.target.style.borderColor = '#FF4444'
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent'
                            e.target.style.color = 'var(--text)'
                            e.target.style.borderColor = 'var(--border)'
                        }}
                    >
                        ⏻ Logout
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN CHAT AREA ═══ */}
            <section
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    position: 'relative',
                    maxWidth: '900px',
                    margin: '0 auto',
                    width: '100%',
                }}
            >
                {/* Top Bar */}
                <header
                    style={{
                        padding: '16px 32px',
                        borderBottom: '2px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg)',
                    }}
                >
                    <span className="brutal-tag">AI SEARCH</span>
                    {currentChatId && (
                        <span
                            className="font-mono"
                            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                        >
                            {chats[currentChatId]?.title}
                        </span>
                    )}
                </header>

                {/* Messages Area */}
                <div
                    className="messages"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '32px',
                        paddingBottom: '180px',
                    }}
                >
                    {/* Empty State */}
                    {currentMessages.length === 0 && !isLoading && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                textAlign: 'center',
                                gap: '16px',
                            }}
                        >
                            <span className="brutal-tag" style={{ fontSize: '11px' }}>
                                AI SEARCH ENGINE
                            </span>
                            <h1
                                className="font-display"
                                style={{
                                    fontSize: '48px',
                                    fontWeight: 700,
                                    color: 'var(--text)',
                                    lineHeight: 1.1,
                                }}
                            >
                                Ask anything.
                                <br />
                                Get real answers.
                            </h1>
                            <p
                                className="font-body"
                                style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '400px' }}
                            >
                                Powered by your backend. No fluff. Just answers.
                            </p>

                            {/* Suggestion Chips */}
                            <div className="flex flex-wrap justify-center gap-2" style={{ marginTop: '24px' }}>
                                {[
                                    'What is quantum entanglement?',
                                    'Best JS frameworks 2025',
                                    'Explain Docker networking',
                                ].map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        className="brutal-chip"
                                        onClick={() => setChatInput(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {currentMessages.map((message, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: '24px',
                                maxWidth: message.role === 'user' ? '75%' : '100%',
                                marginLeft: message.role === 'user' ? 'auto' : '0',
                            }}
                        >
                            <span
                                className="font-display"
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: 'var(--text-muted)',
                                    display: 'block',
                                    marginBottom: '8px',
                                    textAlign: message.role === 'user' ? 'right' : 'left',
                                }}
                            >
                                {message.role === 'user' ? 'YOU' : `QRUX · ${activeModel.name}`}
                            </span>

                            <div
                                style={{
                                    background: message.role === 'user' ? 'var(--surface-alt)' : 'transparent',
                                    border: message.role === 'user' ? '2px solid var(--border)' : 'none',
                                    boxShadow: message.role === 'user' ? '4px 4px 0px var(--shadow)' : 'none',
                                    padding: message.role === 'user' ? '16px' : '0',
                                }}
                            >
                                {message.role === 'user' ? (
                                    <p className="font-body" style={{ fontSize: '15px', color: 'var(--text)', margin: 0 }}>
                                        {message.content}
                                    </p>
                                ) : (
                                    <div className="font-body" style={{ fontSize: '15px', color: 'var(--text)', lineHeight: 1.8 }}>
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p style={{ marginBottom: '12px' }}>{children}</p>,
                                                ul: ({ children }) => <ul style={{ marginBottom: '12px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>,
                                                ol: ({ children }) => <ol style={{ marginBottom: '12px', paddingLeft: '20px', listStyleType: 'decimal' }}>{children}</ol>,
                                                code: ({ children, className }) => {
                                                    const isBlock = className?.includes('language-')
                                                    if (isBlock) {
                                                        return <code className="brutal-code" style={{ display: 'block', marginBottom: '12px' }}>{children}</code>
                                                    }
                                                    return (
                                                        <code className="font-mono" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '2px 6px', fontSize: '13px' }}>
                                                            {children}
                                                        </code>
                                                    )
                                                },
                                                pre: ({ children }) => <pre style={{ margin: 0 }}>{children}</pre>,
                                                strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                                            }}
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading / Searching State */}
                    {isLoading && currentMessages[currentMessages.length - 1]?.role !== 'ai' && (
                        <div style={{ marginBottom: '24px' }}>
                            <span
                                className="font-display"
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: 'var(--text-muted)',
                                    display: 'block',
                                    marginBottom: '8px',
                                }}
                            >
                                QRUX · {activeModel.name}
                            </span>
                            <span className="font-mono" style={{ fontSize: '13px', color: 'var(--accent)' }}>
                                {isSearching ? '[🌐 SEARCHING THE WEB...]' : '[THINKING...]'}
                            </span>
                            <div style={{ marginTop: '12px', width: '300px' }}>
                                <div className="brutal-skeleton" style={{ width: '100%' }} />
                                <div className="brutal-skeleton" style={{ width: '80%' }} />
                                <div className="brutal-skeleton" style={{ width: '60%' }} />
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {chatError && !isLoading && (
                        <div
                            style={{
                                padding: '16px',
                                border: '2px solid #FF4444',
                                background: 'rgba(255, 68, 68, 0.08)',
                                marginBottom: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span className="font-mono" style={{ fontSize: '13px', color: '#FF4444' }}>
                                [ERROR] {chatError}
                            </span>
                            <button
                                type="button"
                                onClick={() => dispatch(setError(null))}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#FF4444',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '16px',
                                    padding: '0 4px',
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* ═══ FOOTER — MODEL SELECTOR + INPUT ═══ */}
                <footer
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '16px 32px 20px',
                        background: 'var(--bg)',
                        borderTop: '2px solid var(--border)',
                    }}
                >
                    {/* Model Selector Row */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px',
                        }}
                    >
                        {/* Model Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'var(--surface-alt)',
                                    border: '2px solid var(--border)',
                                    color: 'var(--text)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12px',
                                    padding: '8px 14px',
                                    cursor: 'pointer',
                                    transition: 'background 60ms linear',
                                }}
                            >
                                <span style={{ fontSize: '10px' }}>{activeModel.badge}</span>
                                <span>{activeModel.name}</span>
                                <span style={{ fontSize: '10px', opacity: 0.5 }}>▼</span>
                            </button>

                            {/* Dropdown Menu */}
                            {showModelDropdown && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: 0,
                                        marginBottom: '4px',
                                        background: 'var(--surface)',
                                        border: '2px solid var(--border)',
                                        boxShadow: '4px 4px 0px var(--shadow)',
                                        minWidth: '260px',
                                        zIndex: 100,
                                    }}
                                >
                                    {availableModels.map((model) => (
                                        <button
                                            key={model.id}
                                            type="button"
                                            onClick={() => {
                                                dispatch(setSelectedModel(model.id))
                                                setShowModelDropdown(false)
                                            }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px 16px',
                                                border: 'none',
                                                borderBottom: '1px solid var(--border)',
                                                background: selectedModel === model.id ? 'var(--accent)' : 'transparent',
                                                color: selectedModel === model.id ? '#0D0D0D' : 'var(--text)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '2px',
                                                transition: 'background 60ms linear',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedModel !== model.id)
                                                    e.currentTarget.style.background = 'var(--surface-alt)'
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedModel !== model.id)
                                                    e.currentTarget.style.background = 'transparent'
                                            }}
                                        >
                                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600 }}>
                                                {model.badge} {model.name}
                                            </span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.6 }}>
                                                {model.description}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Web Search Toggle */}
                        <button
                            type="button"
                            onClick={() => dispatch(setUseWebSearch(!useWebSearch))}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: useWebSearch ? 'var(--accent)' : 'transparent',
                                border: '2px solid var(--border)',
                                color: useWebSearch ? '#0D0D0D' : 'var(--text)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                padding: '8px 14px',
                                cursor: 'pointer',
                                transition: 'background 60ms linear, color 60ms linear',
                            }}
                        >
                            🌐 Web Search: {useWebSearch ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* Input Bar */}
                    <form
                        onSubmit={handleSubmitMessage}
                        style={{
                            display: 'flex',
                            border: '2px solid var(--border)',
                            background: 'var(--surface-alt)',
                        }}
                    >
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask a question..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                height: '56px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '14px',
                                padding: '0 20px',
                                outline: 'none',
                                opacity: isLoading ? 0.5 : 1,
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() || isLoading}
                            style={{
                                width: '56px',
                                height: '56px',
                                background: chatInput.trim() && !isLoading ? 'var(--accent)' : 'var(--surface)',
                                borderLeft: '2px solid var(--border)',
                                border: 'none',
                                borderLeft: '2px solid var(--border)',
                                color: '#0D0D0D',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '18px',
                                cursor: chatInput.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                transition: 'background 60ms linear',
                                flexShrink: 0,
                            }}
                        >
                            ▶
                        </button>
                    </form>
                </footer>
            </section>
        </main>
    )
}

export default Dashboard