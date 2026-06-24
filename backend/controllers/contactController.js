import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export const submitContact = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  const toAddress = process.env.CONTACT_TO || 'rajj94380@gmail.com';

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const sendgridFrom = process.env.SENDGRID_FROM; // verified sender for SendGrid


  // If SendGrid API key is provided, use SendGrid (recommended alternative).
  if (sendgridKey) {
    try {
      sgMail.setApiKey(sendgridKey);
      const fromAddress = sendgridFrom;
      if (!fromAddress) {
        return res.status(500).json({
          message: 'SENDGRID_FROM is required and must be a verified sender in SendGrid.',
        });
      }

      const msg = {
        to: toAddress,
        from: fromAddress,
        replyTo: `${name} <${email}>`,
        subject: `Contact form submission from ${name}`,
        text: `You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        html: `<p>You have a new contact form submission:</p>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`,
      };

      const result = await sgMail.send(msg);
      console.log('SendGrid email sent:', result && result[0] && result[0].statusCode);
      return res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
      console.error('SendGrid send error:', err?.response?.body || err);
      return res.status(500).json({
        message: 'Failed to send message via SendGrid',
        error: err?.response?.body || err?.message || String(err),
      });
    }

  }

  // Fallback to SMTP via nodemailer
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.error('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in .env, or provide SENDGRID_API_KEY');
    return res.status(500).json({ message: 'Mail configuration missing on the server. Contact the administrator.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: smtpUser, // use authenticated user as the from address
      replyTo: `${name} <${email}>`, // replies will go directly to the sender
      to: toAddress,
      subject: `Contact form submission from ${name}`,
      text: `You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      html: `<p>You have a new contact form submission:</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Contact email sent:', info.messageId || info);

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
};

// Dev-only: send a test email using Ethereal and return preview URL
export const sendTestEmail = async (req, res) => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: testAccount.user,
      to: testAccount.user,
      subject: 'Ethereal test email',
      text: 'This is a test email from the dev /api/contact/test endpoint.',
      html: '<p>This is a test email from the dev <strong>/api/contact/test</strong> endpoint.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Ethereal test email sent:', previewUrl);
    return res.status(200).json({ previewUrl });
  } catch (err) {
    console.error('Ethereal test send error:', err);
    return res.status(500).json({ message: 'Failed to send Ethereal test email' });
  }
}
