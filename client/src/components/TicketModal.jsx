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

    const sectionStyle = { marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E8ECF4' }
    const labelStyle = { display: 'block', color: '#1B3A6B', fontWeight: '600', fontSize: '14px', marginBottom: '10px' }
    const inputStyle = { padding: '10px 14px', border: '1.5px solid #E8ECF4', borderRadius: '8px', fontSize: '14px', outline: 'none' }
    const buttonStyle = (disabled) => ({
        padding: '10px 18px',
        backgroundColor: disabled ? '#C9D6E8' : '#1B3A6B',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginLeft: '10px'
    })

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ color: '#1B3A6B', fontSize: '20px', fontWeight: '700' }}>{ticket.customer_name}</h2>
                        <p style={{ color: '#4A4A5A', fontSize: '13px', marginTop: '2px' }}>{ticket.customer_email} · {ticket.customer_phone}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#4A4A5A', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={sectionStyle}>
                    <DetailLine label="VIN" value={ticket.vin} />
                    <DetailLine label="Vehicle" value={`${ticket.vehicle_year || ''} ${ticket.vehicle_make || ''} ${ticket.vehicle_model || ''} ${ticket.vehicle_trim || ''}`.trim() || 'Not decoded'} />
                    <DetailLine label="Problem" value={ticket.problem_description} />
                    <DetailLine label="Status" value={ticket.status} />
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Set Quote Amount</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={quoteAmount}
                            onChange={e => setQuoteAmount(e.target.value)}
                            placeholder="0.00"
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <button onClick={saveQuote} disabled={saving} style={buttonStyle(saving)}>
                            Save
                        </button>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Upload PDF Quote</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={e => setPdfFile(e.target.files[0])}
                            style={{ flex: 1, fontSize: '13px', color: '#4A4A5A' }}
                        />
                        <button onClick={uploadPdf} disabled={saving || !pdfFile} style={buttonStyle(saving || !pdfFile)}>
                            Upload
                        </button>
                    </div>
                </div>

                <div>
                    <button
                        onClick={sendToCustomer}
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor: saving ? '#8FA8C8' : '#2E9E5B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Send to Customer
                    </button>
                </div>

                {message && (
                    <p style={{
                        marginTop: '16px',
                        padding: '10px 14px',
                        backgroundColor: '#F0F4FA',
                        color: '#1B3A6B',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    )
}

function DetailLine({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: '#4A4A5A', fontSize: '13px' }}>{label}</span>
            <span style={{ color: '#1B3A6B', fontSize: '13px', fontWeight: '500', textAlign: 'right', maxWidth: '65%' }}>{value}</span>
        </div>
    )
}

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(27, 58, 107, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
}

const modalStyle = {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
}

export default TicketModal