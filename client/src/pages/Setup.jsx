import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Setup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const shopName = import.meta.env.VITE_SHOP_NAME || 'Your Shop'

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post('http://localhost:3000/api/auth/setup', { email, password }, { withCredentials: true })
            navigate('/login')
        } catch(error) {
            const errors = error.response?.data?.errors
            if (errors) {
                setError(errors.map(e => e.msg).join(', '))
            } else {
                setError(error.response?.data?.message || 'Setup failed.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F0F4FA'
        }}>
            <div style={{
                backgroundColor: '#FFFFFF',
                padding: '48px',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(27, 58, 107, 0.1)',
                width: '100%',
                maxWidth: '420px'
            }}>
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <h1 style={{ color: '#1B3A6B', fontSize: '24px', fontWeight: '700' }}>
                        {shopName}
                    </h1>
                    <p style={{ color: '#4A4A5A', marginTop: '8px' }}>
                        Create Your Admin Account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#1B3A6B' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1.5px solid #E8ECF4',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#1B3A6B' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1.5px solid #E8ECF4',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <p style={{ color: '#4A4A5A', fontSize: '13px', marginBottom: '24px' }}>
                        Must be at least 8 characters with one uppercase letter and one number.
                    </p>

                    {error && (
                        <p style={{
                            color: '#C0392B',
                            backgroundColor: '#FDF0EF',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor: loading ? '#8FA8C8' : '#1B3A6B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Setup