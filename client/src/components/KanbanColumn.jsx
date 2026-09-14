import { useDroppable } from '@dnd-kit/core'
import TicketCard from './TicketCard'

function KanbanColumn({ title, status, tickets }) {
    // id must match the status string — 'new', 'in_progress', 'sent'
    // dnd-kit uses this id to tell you which column something was dropped into
    const { setNodeRef, isOver } = useDroppable({
        id: status
    })

    // isOver is true when a card is being dragged over this column
    // use it to visually highlight the column as a valid drop target
    const style = {
        backgroundColor: isOver ? '#e8f4e8' : '#f5f5f5',
        minHeight: '400px',
        padding: '10px',
        width: '300px'
    }

    return (
        <div ref={setNodeRef} style={style}>
            <h2>{title}</h2>
            {tickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
            ))}
        </div>
    )
}

export default KanbanColumn