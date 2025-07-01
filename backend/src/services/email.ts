import { config } from '../config/index.js'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions) {
  // In production, use a real email service like SendGrid, AWS SES, etc.
  // For now, just log the email
  console.log('📧 Email:', {
    from: config.email.from,
    to: options.to,
    subject: options.subject
  })

  // TODO: Implement actual email sending
  // Example with nodemailer:
  // const transporter = nodemailer.createTransport({
  //   host: config.email.host,
  //   port: config.email.port,
  //   auth: {
  //     user: config.email.user,
  //     pass: config.email.pass
  //   }
  // })
  // 
  // await transporter.sendMail({
  //   from: config.email.from,
  //   ...options
  // })
}