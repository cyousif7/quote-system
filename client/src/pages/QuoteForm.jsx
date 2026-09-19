import { useState, useEffect } from 'react'
import axios from 'axios'

function QuoteForm() {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [vin, setVin] = useState('');
    const [vehicleYear, setVehicleYear] = useState('');
    const [vehicleMake, setVehicleMake] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [problemDescription, setProblemDescription] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submittedToken, setSubmittedToken] = useState(null);
    const [turnstileToken, setTurnstileToken] = useState('');

    const shopName = import.meta.env.VITE_SHOP_NAME || 'Your Shop'

    useEffect(() => {
        window.onTurnstileSuccess = (token) => {
            setTurnstileToken(token)
        }

        const renderTurnstile = () => {
            const widgetDiv = document.querySelector('.cf-turnstile')
            if (window.turnstile && widgetDiv && !widgetDiv.hasChildNodes()) {
                window.turnstile.render('.cf-turnstile', {
                    sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
                    callback: 'onTurnstileSuccess'
                })
            } else if (!window.turnstile) {
                setTimeout(renderTurnstile, 100)
            }
        }

        renderTurnstile()
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()  // stops the page from refreshing on form submit
        setLoading(true);
        
        try {
            // call POST /api/tickets with email 
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tickets`, { 
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                vin: vin || undefined,
                vehicle_year: vehicleYear,
                vehicle_make: vehicleMake,
                vehicle_model: vehicleModel,
                problem_description: problemDescription,
                turnstile_token: turnstileToken 
            });

            // on success, store token
            setSubmittedToken(response.data.tickets.token);
        } 
        
        catch {
            setError("Something went wrong. Please try again.");
        }

        finally {
            setLoading(false);
        };
    };

    if (submittedToken) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F0F4FA'
            }}>
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '48px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(27, 58, 107, 0.1)',
                    width: '100%',
                    maxWidth: '480px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
                    <h2 style={{ color: '#1B3A6B', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                        Request Submitted
                    </h2>
                    <p style={{ color: '#4A4A5A', marginBottom: '24px' }}>
                        We've received your quote request and will be in touch shortly.
                    </p>
                    <a
                        href={`/quote/${submittedToken}`}
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            backgroundColor: '#1B3A6B',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}
                    >
                        Track Your Quote
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F0F4FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={{
                backgroundColor: '#FFFFFF',
                padding: '48px',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(27, 58, 107, 0.1)',
                width: '100%',
                maxWidth: '520px'
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ color: '#1B3A6B', fontSize: '24px', fontWeight: '700' }}>
                        {shopName}
                    </h1>
                    <p style={{ color: '#4A4A5A', marginTop: '8px', fontSize: '15px' }}>
                        Request a quote — no phone call needed.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {[
                        { label: 'Full Name', type: 'text', value: customerName, onChange: setCustomerName, placeholder: 'John Smith' },
                        { label: 'Email Address', type: 'email', value: customerEmail, onChange: setCustomerEmail, placeholder: 'john@example.com' },
                        { label: 'Phone Number', type: 'text', value: customerPhone, onChange: setCustomerPhone, placeholder: '555-123-4567' },
                        { label: 'Vehicle Year', type: 'text', value: vehicleYear, onChange: setVehicleYear, placeholder: '2018' },
                        { label: 'Vehicle Make', type: 'text', value: vehicleMake, onChange: setVehicleMake, placeholder: 'Honda' },
                        { label: 'Vehicle Model', type: 'text', value: vehicleModel, onChange: setVehicleModel, placeholder: 'Civic' },
                        { label: 'Vehicle VIN (optional)', type: 'text', value: vin, onChange: setVin, placeholder: '17-character VIN, if known' },
                    ].map(({ label, type, value, onChange, placeholder }) => (
                        <div key={label} style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#1B3A6B', fontSize: '14px' }}>
                                {label}
                            </label>
                            <input
                                type={type}
                                value={value}
                                onChange={e => onChange(e.target.value)}
                                placeholder={placeholder}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1.5px solid #E8ECF4',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    ))}

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#1B3A6B', fontSize: '14px' }}>
                            What do you need a quote for?
                        </label>
                        <textarea
                            value={problemDescription}
                            onChange={e => setProblemDescription(e.target.value)}
                            placeholder="Describe the issue with your vehicle..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1.5px solid #E8ECF4',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{
                            color: '#C0392B',
                            backgroundColor: '#FDF0EF',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </p>
                    )}

                    <div
                        className="cf-turnstile"
                        data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                        data-callback="onTurnstileSuccess"
                        style={{ marginBottom: '16px' }}
                    ></div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            backgroundColor: loading ? '#8FA8C8' : '#1B3A6B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Submitting...' : 'Request a Quote'}
                    </button>
                </form>
            </div>
        </div>
    )
};

export default QuoteForm;