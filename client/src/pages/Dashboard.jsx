import { useState, useEffect } from 'react'
import axios from 'axios'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import KanbanColumn from '../components/KanbanColumn'
import TicketModal from '../components/TicketModal'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Dashboard() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState(null)

    const shopName = import.meta.env.VITE_SHOP_NAME || 'Your Shop'

    const { logout } = useAuth()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8
            }
        })
    )

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets`, { withCredentials: true })
                setTickets(response.data.tickets)
            } catch {
                // handle error
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [])

    const newTickets = tickets.filter(t => t.status === 'new')
    const inProgressTickets = tickets.filter(t => t.status === 'in_progress')
    const needsInfoTickets = tickets.filter(t => t.status === 'needs_info')
    const sentTickets = tickets.filter(t => t.status === 'sent')

    const handleDragEnd = async (event) => {
        const { active, over } = event
        if (!over) return

        const ticketId = active.id
        const newStatus = over.id

        await axios.patch(`${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}`,
            { status: newStatus },
            { withCredentials: true }
        )

        setTickets(tickets.map(t =>
            t.id === ticketId ? { ...t, status: newStatus } : t
        ))
    }

    const refreshTickets = async () => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets`, { withCredentials: true })
        setTickets(response.data.tickets)

        if (selectedTicket) {
            const updated = response.data.tickets.find(t => t.id === selectedTicket.id)
            if (updated) setSelectedTicket(updated)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#F0F4FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#4A4A5A' }}>Loading tickets...</p>
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
                    {shopName}
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link
                        to="/archived"
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
                        Archived Tickets
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

            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <KanbanColumn title="New" status="new" tickets={newTickets} onTicketClick={setSelectedTicket} />
                        <KanbanColumn title="In Progress" status="in_progress" tickets={inProgressTickets} onTicketClick={setSelectedTicket} />
                        <KanbanColumn title="Needs Info" status="needs_info" tickets={needsInfoTickets} onTicketClick={setSelectedTicket} />
                        <KanbanColumn title="Sent" status="sent" tickets={sentTickets} onTicketClick={setSelectedTicket} />
                    </div>
                </DndContext>
            </div>

            {selectedTicket && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onUpdate={refreshTickets}
                />
            )}
        </div>
    )
}

export default Dashboard