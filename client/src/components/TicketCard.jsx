import { useDraggable } from '@dnd-kit/core'

// ticket is passed in as a prop from Dashboard
function TicketCard({ ticket }) {

    // useDraggable needs a unique id — we use the ticket's database id
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: ticket.id
    })

    // This moves the card visually while dragging
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: 'grabbing'
    } : {
        cursor: 'grab'
    }

    return (
        // setNodeRef registers this div as the draggable element
        // ...listeners makes it respond to drag events
        // ...attributes adds accessibility info
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <p><strong>{ticket.customer_name}</strong></p>
            <p>{ticket.vehicle_year} {ticket.vehicle_make} {ticket.vehicle_model}</p>
            <p>{ticket.problem_description}</p>
            <p>Status: {ticket.status}</p>
        </div>
    )
}

export default TicketCard