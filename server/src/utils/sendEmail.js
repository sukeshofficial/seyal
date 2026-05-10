import transporter from "../config/mail.config.js";

const sendEmail = async ({
  to,
  subject,
  html,
  text = "",
  attachments = [],
  cc,
  bcc,
}) => {
  try {
    const mailOptions = {
      from: `"SEYAL" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
      text,
      attachments,
      cc,
      bcc,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    switch (error.code) {
      case "ECONNECTION":
      case "ETIMEDOUT":
        console.error("Mail network error - retry later:", error.message);
        break;

      case "EAUTH":
        console.error("Mail authentication failed:", error.message);
        break;

      case "EENVELOPE":
        console.error("Invalid email recipients:", error.rejected);
        break;

      default:
        console.error("Email send failed:", error.message);
    }

    // Re-throw so service layer can decide what to do
    throw error;
  }
};

export default sendEmail;
