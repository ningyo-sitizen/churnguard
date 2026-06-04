require("dotenv").config();
const brevo = require("./config/brevo");

async function testEmail() {
    try {
        const res = await brevo.sendTransacEmail({
            sender: {
                name: "ChurnGuard",
                email: "no-reply@sendinblue.com"
            },
            to: [
                { email: "jowymone26@gmail.com" }
            ],
            subject: "Test Email Brevo",
            htmlContent: "<h1>Kalau ini masuk berarti sukses</h1>"
        });

        console.log("EMAIL SUCCESS:", res);
    } catch (err) {
        console.error("EMAIL FAILED:");
        console.error(err.response?.text || err.message);
    }
}

testEmail();