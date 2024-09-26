import nodemailer from 'nodemailer';

// Load environment variables
const { EMAIL_USER, EMAIL_PASS } = process.env;

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Function to handle POST requests to send contact form data via email
export async function POST(req) {
    try {
        // Parse request body
        const formData = await req.json();
        const { fullName, email, phoneNumber, additionalInfo } = formData;

        // Validate required fields
        if (!fullName || !email || !phoneNumber) {
            return new Response(JSON.stringify({ error: 'Please fill all required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create the email options
        const mailOptions = {
            from: EMAIL_USER,
            to: EMAIL_USER, // Send the email to your own email or another recipient
            subject: 'New Contact Us Form Submission',
            html: `
                <p><strong>Full Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                <p><strong>Additional Info:</strong> ${additionalInfo || 'N/A'}</p>
            `,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);

        return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error: 'Failed to send email' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
