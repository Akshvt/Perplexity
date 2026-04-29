import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'


const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    const { handleLogin } = useAuth()
    const navigate = useNavigate()

    const submitForm = async (event) => {
        event.preventDefault()
        await handleLogin({ email, password })
        navigate("/")
    }

    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    return (
        <section
            style={{ background: 'var(--bg)', minHeight: '100vh' }}
            className="flex items-center justify-center px-4"
        >
            {/* Brutalist Login Card */}
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
                    <span className="brutal-tag mb-4 inline-block">SIGN IN</span>

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
                        Welcome back.
                    </h1>
                    <p
                        className="font-body"
                        style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px' }}
                    >
                        Sign in with your email and password.
                    </p>

                    <form onSubmit={submitForm}>
                        {/* Email */}
                        <div style={{ marginBottom: '20px' }}>
                            <label
                                htmlFor="login-email"
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
                                id="login-email"
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
                                htmlFor="login-password"
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
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="brutal-input"
                            />
                        </div>

                        {/* Submit */}
                        <button type="submit" className="brutal-btn w-full" style={{ height: '52px', fontSize: '16px' }}>
                            Login →
                        </button>
                    </form>

                    <p
                        className="font-body"
                        style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}
                    >
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="brutal-link">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login