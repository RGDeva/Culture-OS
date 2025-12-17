import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

interface SendInvitationEmailParams {
  to: string
  projectName: string
  inviterName: string
  inviterEmail: string
  invitationUrl: string
  role: string
  splitPercentage?: number
  message?: string
}

export async function sendCollaboratorInvitation({
  to,
  projectName,
  inviterName,
  inviterEmail,
  invitationUrl,
  role,
  splitPercentage,
  message
}: SendInvitationEmailParams) {
  const splitInfo = splitPercentage ? `\n\nYour contract split: ${splitPercentage}%` : ''
  const customMessage = message ? `\n\nMessage from ${inviterName}:\n"${message}"` : ''

  const mailOptions = {
    from: `"${inviterName} via NoCulture OS" <${process.env.GMAIL_USER}>`,
    replyTo: inviterEmail, // Replies go to the inviter
    to,
    subject: `${inviterName} invited you to collaborate on "${projectName}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: #10b981;
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            background: #059669;
          }
          .details {
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .message-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎵 Collaboration Invitation</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 10px;">
            <strong>${inviterName}</strong> has invited you to collaborate on:
          </p>
          
          <h2 style="color: #10b981; margin: 10px 0;">${projectName}</h2>
          
          <div class="details">
            <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
            <p style="margin: 5px 0;"><strong>Invited by:</strong> ${inviterName} (${inviterEmail})</p>
            ${splitInfo ? `<p style="margin: 5px 0;"><strong>Contract Split:</strong> ${splitPercentage}%</p>` : ''}
          </div>
          
          ${customMessage ? `<div class="message-box"><strong>Personal Message:</strong><br/>${message}</div>` : ''}
          
          <p>Click the button below to accept the invitation and start collaborating:</p>
          
          <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            This invitation will expire in 7 days. If you don't have a NoCulture OS account, 
            you'll be prompted to create one.
          </p>
        </div>
        
        <div class="footer">
          <p>NoCulture OS - Not a Label. A Launch System.</p>
          <p style="font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
${inviterName} has invited you to collaborate on "${projectName}"

Role: ${role}
Invited by: ${inviterName} (${inviterEmail})
${splitInfo}
${customMessage}

Accept the invitation by visiting:
${invitationUrl}

This invitation will expire in 7 days.

---
NoCulture OS - Not a Label. A Launch System.
    `.trim()
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Failed to send invitation email:', error)
    throw new Error('Failed to send invitation email')
  }
}

export async function sendInvitationAcceptedNotification(
  to: string,
  collaboratorName: string,
  collaboratorEmail: string,
  projectName: string
) {
  const mailOptions = {
    from: `"NoCulture OS" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${collaboratorName} accepted your invitation to "${projectName}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">✅ Invitation Accepted!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p><strong>${collaboratorName}</strong> (${collaboratorEmail}) has accepted your invitation to collaborate on <strong>${projectName}</strong>.</p>
          <p>They can now access the project and start contributing.</p>
        </div>
      </body>
      </html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Failed to send acceptance notification:', error)
  }
}
