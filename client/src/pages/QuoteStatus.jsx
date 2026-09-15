import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function QuoteStatus() {
    const { token } = useParams()
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const shopName = import.meta.env.VITE_SHOP_NAME || 'Your Shop'

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/tickets/${token}/status`)
                setTicket(response.data.tickets)
            } catch {
                setError('We couldn\'t find a quote with this link.')
            } finally {
                setLoading(false)
            }
        }
        fetchTicket()
    }, [token])

    const containerStyle = {
        minHeight: '100vh',
        backgroundColor: '#F0F4FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
    }

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(27, 58, 107, 0.1)',
        width: '100%',
        maxWidth: '520px'
    }

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <p style={{ color: '#4A4A5A', textAlign: 'center' }}>Loading your quote...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <p style={{ color: '#C0392B', textAlign: 'center' }}>{error}</p>
                </div>
            </div>
        )
    }

    const statusConfig = {
        new: { label: 'Received', color: '#2E5BA8', bg: '#EAF0FA' },
        in_progress: { label: 'In Progress', color: '#B7791F', bg: '#FDF3E3' },
        sent: { label: 'Quote Ready', color: '#1E7A4A', bg: '#E6F5EC' }
    }

    const currentStatus = statusConfig[ticket.status] || statusConfig.new

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ color: '#1B3A6B', fontSize: '24px', fontWeight: '700' }}>
                        {shopName}
                    </h1>
                    <p style={{ color: '#4A4A5A', fontSize: '14px' }}>Quote Status</p>
                </div>

                <div style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: currentStatus.bg,
                    color: currentStatus.color,
                    fontWeight: '600',
                    fontSize: '13px',
                    marginBottom: '24px'
                }}>
                    {currentStatus.label}
                </div>

                <div style={{ borderTop: '1px solid #E8ECF4', paddingTop: '20px' }}>
                    <DetailRow label="Name" value={ticket.customer_name} />
                    <DetailRow label="Vehicle" value={`${ticket.vehicle_year || ''} ${ticket.vehicle_make || ''} ${ticket.vehicle_model || ''}`.trim() || 'Not decoded'} />
                    <DetailRow label="Issue" value={ticket.problem_description} />
                    {ticket.quote_amount && (
                        <DetailRow label="Quote Amount" value={`$${ticket.quote_amount}`} highlight />
                    )}
                </div>

                {ticket.status === 'new' && (
                    <p style={{ marginTop: '24px', color: '#4A4A5A', fontSize: '14px' }}>
                        We've received your request and will follow up with a quote shortly.
                    </p>
                )}
                {ticket.status === 'in_progress' && (
                    <p style={{ marginTop: '24px', color: '#4A4A5A', fontSize: '14px' }}>
                        Your quote is being prepared. Check back soon.
                    </p>
                )}
                {ticket.status === 'sent' && (
                    <p style={{ marginTop: '24px', color: '#4A4A5A', fontSize: '14px' }}>
                        Check your email for the full quote details.
                    </p>
                )}
            </div>
        </div>
    )
}

function DetailRow({ label, value, highlight }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #F0F4FA'
        }}>
            <span style={{ color: '#4A4A5A', fontSize: '14px' }}>{label}</span>
            <span style={{
                color: highlight ? '#1B3A6B' : '#1B3A6B',
                fontWeight: highlight ? '700' : '500',
                fontSize: highlight ? '17px' : '14px'
            }}>
                {value}
            </span>
        </div>
    )
}

export default QuoteStatus