import { useState } from 'react'
import axios from 'axios'

function TicketModal({ ticket, onClose, onUpdate }) {
    const [quoteAmount, setQuoteAmount] = useState(ticket.quote_amount || '')
    const [pdfFile, setPdfFile] = useState(null)
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)

    const saveQuote = async () => {
        setSaving(true)
        try {
            await axios.patch(`http://localhost:3000/api/tickets/${ticket.id}/quote`,
                { quote_amount: quoteAmount },
                { withCredentials: true }
            )
            setMessage('Quote saved.')
            onUpdate()
        } catch {
            setMessage('Failed to save quote.')
        } finally {
            setSaving(false)
        }
    }

    const uploadPdf = async () => {
        if (!pdfFile) return
        setSaving(true)
        const formData = new FormData()
        formData.append('pdf', pdfFile)
        try {
            await axios.post(`http://localhost:3000/api/tickets/${ticket.id}/upload`,
                formData,
                { withCredentials: true }
            )
            setMessage('PDF uploaded.')
            onUpdate()
        } catch {
            setMessage('Failed to upload PDF.')
        } finally {
            setSaving(false)
        }
    }

    const sendToCustomer = async () => {
        if (!ticket.pdf_path) {
            const confirmed = window.confirm(
                'No PDF has been uploaded for this ticket. Send email without attachment?'
            )
            if (!confirmed) return
        }

        setSaving(true)
        try {
            await axios.post(`http://localhost:3000/api/tickets/${ticket.id}/send`,
                {},
                { withCredentials: true }
            )
            setMessage('Sent to customer.')
            onUpdate()
            onClose()
        } catch {
            setMessage('Failed to send.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <button onClick={onClose}>✕ Close</button>

                <h2>{ticket.customer_name}</h2>
                <p>Email: {ticket.customer_email}</p>
                <p>Phone: {ticket.customer_phone}</p>
                <p>VIN: {ticket.vin}</p>
                <p>Vehicle: {ticket.vehicle_year} {ticket.vehicle_make} {ticket.vehicle_model} {ticket.vehicle_trim}</p>
                <p>Problem: {ticket.problem_description}</p>
                <p>Status: {ticket.status}</p>

                <hr />

                <h3>Set Quote Amount</h3>
                <input
                    type="number"
                    value={quoteAmount}
                    onChange={e => setQuoteAmount(e.target.value)}
                    placeholder="Enter amount"
                />
                <button onClick={saveQuote} disabled={saving}>Save Quote</button>

                <h3>Upload PDF</h3>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setPdfFile(e.target.files[0])}
                />
                <button onClick={uploadPdf} disabled={saving || !pdfFile}>Upload</button>

                <h3>Send to Customer</h3>
                <button onClick={sendToCustomer} disabled={saving}>Send to Customer</button>

                {message && <p>{message}</p>}
            </div>
        </div>
    )
}

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
}

const modalStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '500px',
    maxHeight: '80vh',
    overflowY: 'auto'
}

export default TicketModal