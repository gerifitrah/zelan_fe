import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import './LoginPage.css'

function LoginPage() {
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await authApi.login(credentials)

            console.log('Login response:', response.data)

            // Extract token from response.data.data.token
            const token = response.data.data?.token || response.data.token || 'authenticated'
            const user = response.data.data?.user

            // Store auth token and user info
            localStorage.setItem('authToken', token)
            localStorage.setItem('isAuthenticated', 'true')
            if (user) {
                localStorage.setItem('user', JSON.stringify(user))
            }

            console.log('Auth stored, redirecting to /admin')

            // Redirect to admin page
            navigate('/admin')
        } catch (err) {
            console.error('Login error:', err)
            setError(err.response?.data?.message || 'Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <img src="/logo-light.png" alt="Zelan Bakery" className="login-logo" />
                        <h1>Admin Login</h1>
                        <p>Enter your credentials to access the admin panel</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="loading-spinner-small"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Login
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <a href="/" className="back-home">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
