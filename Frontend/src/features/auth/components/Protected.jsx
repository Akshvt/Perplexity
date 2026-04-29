import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'


const Protected = ({ children }) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
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

                <span
                    className="font-mono"
                    style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                >
                    [LOADING...]
                </span>

                {/* Brutal skeleton lines */}
                <div style={{ width: '200px' }}>
                    <div className="brutal-skeleton" style={{ width: '100%' }} />
                    <div className="brutal-skeleton" style={{ width: '75%' }} />
                    <div className="brutal-skeleton" style={{ width: '50%' }} />
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected