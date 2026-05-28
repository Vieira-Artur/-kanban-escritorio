import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export function sendMentionEmail({ toEmail, toName, fromName, taskTitle, commentText }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email:     toEmail,
    to_name:      toName,
    from_name:    fromName,
    task_title:   taskTitle,
    comment_text: commentText,
    app_url:      `${window.location.origin}/kanban-escritorio/`,
  }, PUBLIC_KEY)
}
