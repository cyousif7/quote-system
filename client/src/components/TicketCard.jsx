import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function TicketCard({ ticket, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: ticket.id
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: 'white',
        padding: '10px',
        marginBottom: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div {...listeners}>
                <p><strong>{ticket.customer_name}</strong></p>
                <p>{ticket.vehicle_year} {ticket.vehicle_make} {ticket.vehicle_model}</p>
                <p>{ticket.problem_description}</p>
            </div>
            <button onClick={onClick}>View Details</button>
        </div>
    )
}

export default TicketCard