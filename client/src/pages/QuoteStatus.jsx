import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function QuoteStatus() {
    const { token } = useParams()
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/tickets/${token}/status`)
                setTicket(response.data.tickets)
            } catch {
                setError('Quote not found.')
            } finally {
                setLoading(false)
            }
        }
        fetchTicket()
    }, [token])

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div>
            <h1>Quote Status</h1>
            <p>Name: {ticket.customer_name}</p>
            <p>Vehicle: {ticket.vehicle_year} {ticket.vehicle_make} {ticket.vehicle_model}</p>
            <p>Issue: {ticket.problem_description}</p>
            <p>Status: {ticket.status}</p>
            {ticket.quote_amount && <p>Quote Amount: ${ticket.quote_amount}</p>}
        </div>
    )
}

export default QuoteStatus