import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const shopName = import.meta.env.VITE_SHOP_NAME || 'Your Shop'

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()  // stops the page from refreshing on form submit
        try {
            // call POST /api/auth/login with email and password
            const response = await axios.post('http://localhost:3000/api/auth/login', { email, password }, { withCredentials: true });

            // on success navigate to /dashboard
            navigate('/dashboard');

        } catch {
            setError('Invalid email or password.');
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
                        Staff Portal
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
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
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
                        style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor: '#1B3A6B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;