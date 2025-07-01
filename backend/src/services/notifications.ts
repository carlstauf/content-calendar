import { User, Comment, Post } from '@prisma/client'
import { config } from '../config/index.js'
import { sendEmail } from './email.js'

interface MentionNotificationData {
  user: User
  comment: Comment
  post: Post
  author: User
}

export async function sendMentionNotification(data: MentionNotificationData) {
  const { user, comment, post, author } = data

  // Skip if email service not configured
  if (!config.email.host) {
    console.log(`Mention notification skipped - email not configured`)
    return
  }

  const subject = `${author.name} mentioned you in a comment`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You were mentioned in a comment</h2>
      <p><strong>${author.name}</strong> mentioned you in a comment on the post "${post.title}":</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;">${comment.content}</p>
      </div>
      
      <p>
        <a href="${config.corsOrigin}/posts/${post.id}" 
           style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Post
        </a>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">
      <p style="color: #666; font-size: 12px;">
        You're receiving this email because someone mentioned you in Final Round AI Content Calendar.
      </p>
    </div>
  `

  await sendEmail({
    to: user.email,
    subject,
    html
  })
}