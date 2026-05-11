import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AlphaPulse] Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#07080A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '480px',
            padding: '2.5rem',
            background: 'rgba(13,15,20,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #F87171, #DC2626 60%, transparent 70%)',
              boxShadow: '0 0 40px rgba(248,113,113,0.3)',
              margin: '0 auto 1.5rem',
            }} />

            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(to right, #F87171, #FCA5A5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.75rem',
            }}>
              Signal Lost
            </h1>

            <p style={{
              color: '#94A3B8',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}>
              AlphaPulse encountered an unexpected error. This might be a temporary network issue.
            </p>

            <pre style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              color: '#F87171',
              background: 'rgba(248,113,113,0.06)',
              padding: '0.75rem',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '100px',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              style={{
                background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Reconnect
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
