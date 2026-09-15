const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendQuoteEmail(customerName, customerEmail, quoteAmount, pdfPath, token, workerMessage) {
    try {
        const shopName = process.env.SHOP_NAME || 'Your Shop';
        const statusUrl = `${process.env.CLIENT_URL}/quote/${token}`;

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #F0F4FA; padding: 32px;">
            <div style="background-color: #FFFFFF; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(27, 58, 107, 0.1);">
                <h1 style="color: #1B3A6B; font-size: 22px; margin: 0 0 8px 0;">${shopName}</h1>
                <p style="color: #4A4A5A; font-size: 15px; margin: 0 0 24px 0;">Your Quote is Ready</p>

                <p style="color: #4A4A5A; font-size: 15px; line-height: 1.6;">
                    Hello ${customerName},
                </p>
                <p style="color: #4A4A5A; font-size: 15px; line-height: 1.6;">
                    Thank you for reaching out to ${shopName}. Here are the details of your quote:
                </p>

                <div style="background-color: #F0F4FA; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; color: #4A4A5A; font-size: 13px;">Quote Amount</p>
                    <p style="margin: 4px 0 0 0; color: #1B3A6B; font-size: 28px; font-weight: 700;">$${quoteAmount}</p>
                </div>

                ${workerMessage ? `
                <div style="border-left: 3px solid #2E5BA8; padding-left: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: #4A4A5A; font-size: 13px; font-weight: 600;">Note from our team</p>
                    <p style="margin: 6px 0 0 0; color: #4A4A5A; font-size: 14px; line-height: 1.5;">${workerMessage}</p>
                </div>
                ` : ''}

                <a href="${statusUrl}" style="display: inline-block; margin-top: 16px; padding: 13px 24px; background-color: #1B3A6B; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                    View Full Details
                </a>

                <p style="color: #8FA0B8; font-size: 12px; margin-top: 32px;">
                    ${pdfPath ? 'A detailed quote document is attached to this email.' : ''}
                </p>
            </div>
        </div>
        `;

        const emailOptions = {
            from: `${shopName} <onboarding@resend.dev>`,
            to: customerEmail,
            subject: 'Your Quote is Ready',
            html
        };

        if (pdfPath) {
            const fileContent = fs.readFileSync(pdfPath);
            const base64Content = fileContent.toString('base64');
            emailOptions.attachments = [{
                filename: path.basename(pdfPath),
                content: base64Content
            }];
        }

        await resend.emails.send(emailOptions);
    }

    catch(error) {
        logger.error(error.message);
        throw error;
    };
};

module.exports = sendQuoteEmail;