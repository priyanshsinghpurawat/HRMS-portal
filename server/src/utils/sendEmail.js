/**
 * Mock email sending utility
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body text
 * @returns {Promise<boolean>} Resolves to true when logged
 */
export const sendEmail = async ({ to, subject, body }) => {
    console.log(`\n================ EMAIL SENT ================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log(`============================================\n`);
    return true;
};
