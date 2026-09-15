import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// This function will allow users to create accounts
function Setup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()  // stops the page from refreshing on form submit
        try {
            // call POST /api/auth/login with email and password
            const response = await axios.post('http://localhost:3000/api/auth/setup', { email, password }, { withCredentials: true });

            // on success navigate to /dashboard
            console.log("Successfully logged out.")
            navigate('/login');

        } catch(error) {
            const errors = error.response?.data?.errors
            if (errors) {
                setError(errors.map(e => e.msg).join(', '))
            } else {
                setError(error.response?.data?.message || 'Setup failed.')
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Create Account</button>
            {error && <p>{error}</p>}
        </form>
    );
};

export default Setup;