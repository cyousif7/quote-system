import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/tickets', { withCredentials: true })
                setTickets(response.data.tickets)
            } catch {
                // handle error
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [])

    if (loading) return <div>Loading...</div>

    const newTickets = tickets.filter(t => t.status === 'new')
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress')
    const sentTickets = tickets.filter(t => t.status === 'sent')    

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <div>
                <h2>New</h2>
                {newTickets.map(ticket => (
                    <div key={ticket.id}>
                        <p>{ticket.customer_name}</p>
                        <p>{ticket.problem_description}</p>
                    </div>
                ))}
            </div>

            <div>
                <h2>In Progress</h2>
                {inProgressTickets.map(ticket => (
                    <div key={ticket.id}>
                        <p>{ticket.customer_name}</p>
                        <p>{ticket.problem_description}</p>
                    </div>
                ))}
            </div>

            <div>
                <h2>Sent</h2>
                {sentTickets.map(ticket => (
                    <div key={ticket.id}>
                        <p>{ticket.customer_name}</p>
                        <p>{ticket.problem_description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard