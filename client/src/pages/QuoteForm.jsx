import { useState } from 'react'
import axios from 'axios'

function QuoteForm() {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [vin, setVin] = useState('');
    const [problemDescription, setProblemDescription] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submittedToken, setSubmittedToken] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault()  // stops the page from refreshing on form submit
        setLoading(true);
        
        try {
            // call POST /api/tickets with email 
            const response = await axios.post('http://localhost:3000/api/tickets', { 
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                vin,
                problem_description: problemDescription 
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
            <div>
                <h2>Request Submitted!</h2>
                <p>Track your quote status here:</p>
                <a href={`/quote/${submittedToken}`}>View Quote Status</a>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name"
            />
            <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number"
            />
            <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="VIN"
            />
            <input
                type="text"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Problem Description"
            />
            <button type="submit" disabled = {loading}>
                {loading ? 'Submitting...' : 'Get a Quote'}
            </button>
            {error && <p>{error}</p>}
        </form>
    );
};

export default QuoteForm;