const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendQuoteEmail(customerName, customerEmail, quoteAmount, pdfPath) {
    try{
        // Read the PDF file and convert to base64
        const fileContent = fs.readFileSync(pdfPath);
        const base64Content = fileContent.toString('base64');
        const fileName = path.basename(pdfPath);

        await resend.emails.send({
            from: 'Your Shop <onboarding@resend.dev>',
            to: customerEmail,
            subject: 'Your Quote is Ready',
            html: `<p>Hello ${customerName}, </p><p>Your quote has been prepared. The total is $${quoteAmount}. Please find the full quote attached.</p>`,
            attachments: [{
                filename: fileName,
                content: base64Content
            }]
        });
    }

    catch(error) {
        console.log("ERROR: ", error.message);
        throw error;
    };
};

module.exports = sendQuoteEmail;