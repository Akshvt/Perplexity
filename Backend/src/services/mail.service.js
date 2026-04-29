import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: 'OAuth2',
            user: process.env.GOOGLE_USER,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            clientId: process.env.GOOGLE_CLIENT_ID
        }
    });

    return transporter;
}


export async function sendEmail({ to, subject, html, text }) {

    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };

    const details = await getTransporter().sendMail(mailOptions);
    console.log("Email sent:", details);
}