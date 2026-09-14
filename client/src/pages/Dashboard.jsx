import { useState, useEffect } from 'react'
import axios from 'axios'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import KanbanColumn from '../components/KanbanColumn'
import TicketModal from '../components/TicketModal'

function Dashboard() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8  // must drag 8px before it counts as a drag
            }
        })
    )

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

    const handleDragEnd = async (event) => {
        const { active, over } = event

        // if dropped outside a column, do nothing
        if (!over) return

        const ticketId = active.id
        const newStatus = over.id

        // update backend
        await axios.patch(`http://localhost:3000/api/tickets/${ticketId}`, 
            { status: newStatus }, 
            { withCredentials: true }
        )

        // update local state instantly so UI reflects change without refetching
        setTickets(tickets.map(t => 
            t.id === ticketId ? { ...t, status: newStatus } : t
        ))
    }

    const refreshTickets = async () => {
        const response = await axios.get('http://localhost:3000/api/tickets', { withCredentials: true })
        setTickets(response.data.tickets)
    }

    return (
        <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <KanbanColumn title="New" status="new" tickets={newTickets} onTicketClick={setSelectedTicket} />
                    <KanbanColumn title="In Progress" status="in_progress" tickets={inProgressTickets} onTicketClick={setSelectedTicket} />
                    <KanbanColumn title="Sent" status="sent" tickets={sentTickets} onTicketClick={setSelectedTicket} />
                </div>
            </DndContext>
            {selectedTicket && (
                <TicketModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onUpdate={refreshTickets}
                />
            )}
        </>
    )

}

export default Dashboard