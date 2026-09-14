const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendQuoteEmail(customerName, customerEmail, quoteAmount, pdfPath, token) {
    try {
        const emailOptions = {
            from: 'Your Shop <onboarding@resend.dev>',
            to: customerEmail,
            subject: 'Your Quote is Ready',
            html: `<p>Hello ${customerName}, </p><p>Your quote has been prepared. The total is $${quoteAmount}. Here are all the details of your quote: ${process.env.CLIENT_URL}/quote/${token}.</p>`,
        }

        // only attach PDF if one exists
        if (pdfPath) {
            const fileContent = fs.readFileSync(pdfPath)
            const base64Content = fileContent.toString('base64')
            emailOptions.attachments = [{
                filename: path.basename(pdfPath),
                content: base64Content
            }]
        }

        await resend.emails.send(emailOptions)
    }

    catch(error) {
        logger.error(error.message);
        throw error;
    };
};

module.exports = sendQuoteEmail;