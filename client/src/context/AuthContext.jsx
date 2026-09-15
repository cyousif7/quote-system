import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkAuth = async () => {
            try {
                // call /api/auth/me to check if logged in
                const response = await axios.get('http://localhost:3000/api/auth/me', { withCredentials: true });

                // if success, setUser(data.user)
                setUser(response.data.user);
            }

            catch {
                // if 401, setUser(null)
                setUser(null);
            }

            finally {
                // always setLoading(false) when done
                setLoading(false);
            };
        }

        checkAuth();

    }, []);

    const login = async (email, password) => {
        await axios.post('http://localhost:3000/api/auth/login', { email, password }, { withCredentials: true })
        const response = await axios.get('http://localhost:3000/api/auth/me', { withCredentials: true })
        setUser(response.data.user)
    }

    const logout = async () => {
        // call POST /api/auth/logout
        const response = await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true })

        // then setUser(null)
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext)
};