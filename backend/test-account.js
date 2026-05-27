require("dotenv").config();
const { Resend } = require("resend");

// INIT CLIENT
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const response = await resend.emails.send({
      from: "ChurnGuard <onboarding@resend.dev>", 
      to: "lori260305@gmail.com",
      subject: "🔥 Test Email dari Resend",
      html: `
        <div style="font-family: Arial; text-align:center;">
          <h1>SUCCESS 🚀</h1>
          <p>Kalau ini masuk berarti email kamu sudah jalan</p>
          <h2>OTP: 123456</h2>
        </div>
      `
    });

    console.log("✅ EMAIL SENT SUCCESS");
    console.log(response);

  } catch (error) {
    console.error("❌ EMAIL FAILED");
    console.error(error);
  }
}

sendTestEmail();