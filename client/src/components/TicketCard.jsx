import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

const statusColors = {
    new: '#2E5BA8',
    in_progress: '#D4A017',
    needs_info: '#C0392B',
    sent: '#2E9E5B'
}

function TicketCard({ ticket, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: ticket.id
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#FFFFFF',
        padding: '16px',
        marginBottom: '12px',
        borderRadius: '8px',
        border: '1px solid #E8ECF4',
        borderLeft: `4px solid ${statusColors[ticket.status] || '#2E5BA8'}`,
        boxShadow: '0 1px 3px rgba(27, 58, 107, 0.06)'
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div {...listeners}>
                <p style={{ fontWeight: '600', color: '#1B3A6B', marginBottom: '4px', fontSize: '15px' }}>
                    {ticket.customer_name}
                </p>
                <p style={{ color: '#4A4A5A', fontSize: '13px', marginBottom: '6px' }}>
                    {ticket.vehicle_year} {ticket.vehicle_make} {ticket.vehicle_model}
                </p>
                <p style={{ color: '#4A4A5A', fontSize: '13px', marginBottom: '10px' }}>
                    {ticket.problem_description}
                </p>
            </div>
            <button
                onClick={onClick}
                style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#F0F4FA',
                    color: '#1B3A6B',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}
            >
                View Details
            </button>
            {(ticket.quote_sent_at || ticket.info_request_sent_at) && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {ticket.quote_sent_at && (
                        <span style={{ fontSize: '11px', color: '#2E9E5B' }}>
                            ✓ Quote Sent — {new Date(ticket.quote_sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(ticket.quote_sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                    )}
                    {ticket.info_request_sent_at && (
                        <span style={{ fontSize: '11px', color: '#B7791F' }}>
                            ✓ Info Requested — {new Date(ticket.info_request_sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(ticket.info_request_sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default TicketCard