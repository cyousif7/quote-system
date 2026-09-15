const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendQuoteEmail(customerName, customerEmail, quoteAmount, pdfPath, token) {
    try {
        const emailOptions = {
            from: `${process.env.SHOP_NAME || 'Your Shop'} <onboarding@resend.dev>`,
            to: customerEmail,
            subject: 'Your Quote is Ready',
            html: `<p>Hello ${customerName},</p><p>Thank you for reaching out to ${process.env.SHOP_NAME || 'us'}. Your quote has been prepared — the total comes to $${quoteAmount}. You can view the full details and track your quote anytime here: ${process.env.CLIENT_URL}/quote/${token}.</p>`,
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