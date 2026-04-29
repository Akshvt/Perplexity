import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'


const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [registered, setRegistered] = useState(false)

    const loading = useSelector(state => state.auth.loading)
    const error = useSelector(state => state.auth.error)

    const { handleRegister } = useAuth()

    const submitForm = async (event) => {
        event.preventDefault()
        try {
            await handleRegister({ username, email, password })
            setRegistered(true)
        } catch (err) {
            // error handled by Redux
        }
    }

    // Success screen — "Check your email"
    if (registered && !error) {
        return (
            <section
                style={{ background: 'var(--bg)', minHeight: '100vh' }}
                className="flex items-center justify-center px-4"
            >
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center gap-3">
                        <span
                            className="brutal-tag"
                            style={{ fontSize: '16px', padding: '6px 12px', letterSpacing: '0' }}
                        >
                            ■
                        </span>
                        <h2
                            className="font-display"
                            style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}
                        >
                            QRUX
                        </h2>
                    </div>

                    <div className="brutal-card" style={{ textAlign: 'center' }}>
                        <span className="brutal-tag mb-4 inline-block">✓ REGISTERED</span>

                        <h1
                            className="font-display"
                            style={{
                                fontSize: '32px',
                                fontWeight: 700,
                                color: 'var(--text)',
                                lineHeight: 1.2,
                                marginBottom: '12px'
                            }}
                        >
                            Check your email.
                        </h1>
                        <p
                            className="font-body"
                            style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '8px' }}
                        >
                            We sent a verification link to:
                        </p>
                        <p
                            className="font-mono"
                            style={{
                                fontSize: '14px',
                                color: 'var(--text)',
                                background: 'var(--surface-alt)',
                                border: '2px solid var(--border)',
                                padding: '10px 16px',
                                display: 'inline-block',
                                marginBottom: '24px'
                            }}
                        >
                            {email}
                        </p>
                        <p
                            className="font-body"
                            style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}
                        >
                            Click the link in the email, then come back and log in.
                        </p>

                        <Link to="/login" className="brutal-btn" style={{ width: '100%', height: '52px', fontSize: '16px', textDecoration: 'none' }}>
                            Go to Login →
                        </Link>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section
            style={{ background: 'var(--bg)', minHeight: '100vh' }}
            className="flex items-center justify-center px-4"
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-3">
                    <span
                        className="brutal-tag"
                        style={{ fontSize: '16px', padding: '6px 12px', letterSpacing: '0' }}
                    >
                        ■
                    </span>
                    <h2
                        className="font-display"
                        style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}
                    >
                        QRUX
                    </h2>
                </div>

                {/* Card */}
                <div className="brutal-card">
                    <span className="brutal-tag mb-4 inline-block">CREATE ACCOUNT</span>

                    <h1
                        className="font-display"
                        style={{
                            fontSize: '36px',
                            fontWeight: 700,
                            color: 'var(--text)',
                            lineHeight: 1.1,
                            marginBottom: '8px'
                        }}
                    >
                        Join QRUX.
                    </h1>
                    <p
                        className="font-body"
                        style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px' }}
                    >
                        Register with your username, email, and password.
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div
                            style={{
                                background: 'var(--danger)',
                                color: '#FFFFFF',
                                border: '2px solid var(--border)',
                                padding: '12px 16px',
                                marginBottom: '20px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                            }}
                        >
                            ✗ {error}
                        </div>
                    )}

                    <form onSubmit={submitForm}>
                        {/* Username */}
                        <div style={{ marginBottom: '20px' }}>
                            <label
                                htmlFor="reg-username"
                                className="font-display"
                                style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: 'var(--text)',
                                    marginBottom: '8px'
                                }}
                            >
                                Username
                            </label>
                            <input
                                id="reg-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                                className="brutal-input"
                            />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '20px' }}>
                            <label
                                htmlFor="reg-email"
                                className="font-display"
                                style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: 'var(--text)',
                                    marginBottom: '8px'
                                }}
                            >
                                Email
                            </label>
                            <input
                                id="reg-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="brutal-input"
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '32px' }}>
                            <label
                                htmlFor="reg-password"
                                className="font-display"
                                style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: 'var(--text)',
                                    marginBottom: '8px'
                                }}
                            >
                                Password
                            </label>
                            <input
                                id="reg-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password (min 6 chars)"
                                required
                                className="brutal-input"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="brutal-btn w-full"
                            style={{ height: '52px', fontSize: '16px' }}
                            disabled={loading}
                        >
                            {loading ? '[REGISTERING...]' : 'Register →'}
                        </button>
                    </form>

                    <p
                        className="font-body"
                        style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}
                    >
                        Already have an account?{' '}
                        <Link to="/login" className="brutal-link">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Register