import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function ArchivedTickets() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { logout } = useAuth()

    useEffect(() => {
        const fetchArchived = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/archived`, { withCredentials: true })
                setTickets(response.data.tickets)
            } catch {
                // handle error silently for now
            } finally {
                setLoading(false)
            }
        }
        fetchArchived()
    }, [])

    const filteredTickets = tickets.filter(t =>
        t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const restoreTicket = async (ticketId) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}`,
                { status: 'new' },
                { withCredentials: true }
            )
            setTickets(tickets.filter(t => t.id !== ticketId))
        } catch {
            alert('Failed to restore ticket.')
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#F0F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#4A4A5A' }}>Loading archived tickets...</p>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
            <div style={{
                backgroundColor: '#1B3A6B',
                padding: '20px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h1 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '700' }}>
                    Archived Tickets
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link
                        to="/dashboard"
                        style={{
                            padding: '9px 18px',
                            backgroundColor: 'transparent',
                            color: '#FFFFFF',
                            border: '1.5px solid rgba(255,255,255,0.4)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}
                    >
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={logout}
                        style={{
                            padding: '9px 18px',
                            backgroundColor: 'transparent',
                            color: '#FFFFFF',
                            border: '1.5px solid rgba(255,255,255,0.4)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by customer name or email..."
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1.5px solid #E8ECF4',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        marginBottom: '24px'
                    }}
                />

                {filteredTickets.length === 0 ? (
                    <p style={{ color: '#8FA0B8', textAlign: 'center', marginTop: '48px' }}>
                        No archived tickets found.
                    </p>
                ) : (
                    filteredTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            style={{
                                backgroundColor: '#F0F4FA',
                                borderRadius: '8px',
                                padding: '16px 20px',
                                marginBottom: '12px'
                            }}
                        >
                            <p style={{ fontWeight: '600', color: '#1B3A6B', fontSize: '15px', marginBottom: '4px' }}>
                                {ticket.customer_name}
                            </p>
                            <p style={{ color: '#4A4A5A', fontSize: '13px', marginBottom: '4px' }}>
                                {ticket.customer_email} · {ticket.customer_phone}
                            </p>
                            <p style={{ color: '#4A4A5A', fontSize: '13px', marginBottom: '4px' }}>
                                {ticket.vehicle_year} {ticket.vehicle_make} {ticket.vehicle_model} — {ticket.problem_description}
                            </p>
                            {ticket.quote_amount && (
                                <p style={{ color: '#2E9E5B', fontSize: '13px', fontWeight: '600' }}>
                                    Quote: ${ticket.quote_amount}
                                </p>
                            )}

                            <button
                                onClick={() => restoreTicket(ticket.id)}
                                style={{
                                    marginTop: '8px',
                                    padding: '6px 14px',
                                    backgroundColor: '#1B3A6B',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Restore to Dashboard
                            </button>

                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default ArchivedTickets