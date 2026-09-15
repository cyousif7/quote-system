import { useDroppable } from '@dnd-kit/core'
import TicketCard from './TicketCard'

const columnAccents = {
    new: '#2E5BA8',
    in_progress: '#D4A017',
    needs_info: '#C0392B',
    sent: '#2E9E5B'
}

function KanbanColumn({ title, status, tickets, onTicketClick }) {
    const { setNodeRef, isOver } = useDroppable({
        id: status
    })

    const style = {
        backgroundColor: isOver ? '#E8ECF4' : '#F0F4FA',
        borderRadius: '10px',
        padding: '16px',
        minHeight: '500px',
        width: '320px',
        transition: 'background-color 0.15s'
    }

    return (
        <div ref={setNodeRef} style={style}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: `2px solid ${columnAccents[status]}`
            }}>
                <h2 style={{ color: '#1B3A6B', fontSize: '16px', fontWeight: '700' }}>
                    {title}
                </h2>
                <span style={{
                    backgroundColor: columnAccents[status],
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '2px 9px',
                    borderRadius: '12px'
                }}>
                    {tickets.length}
                </span>
            </div>

            {tickets.length === 0 ? (
                <p style={{ color: '#8FA0B8', fontSize: '13px', textAlign: 'center', marginTop: '32px' }}>
                    No tickets here
                </p>
            ) : (
                tickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} />
                ))
            )}
        </div>
    )
}

export default KanbanColumn