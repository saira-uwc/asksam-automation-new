import nodemailer from 'nodemailer';

export async function sendMail(subject: string, text: string, attachments: { path: string; filename?: string }[] = []) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `Automation <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject,
    text,
    attachments
  });
}
