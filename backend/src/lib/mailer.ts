export async function sendEmail(to: string, subject: string, html: string) {
  console.log('EMAIL =>', { to, subject, html });
}
