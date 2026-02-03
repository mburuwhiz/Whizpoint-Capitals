const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const sendEmail = async (options) => {
  // Check user preferences if available
  if (options.user && options.type) {
    const prefMap = {
      'login': 'loginAlerts',
      'withdrawal': 'withdrawalAlerts',
      'transfer': 'transferAlerts',
      'verification': 'verificationEmails',
      'marketing': 'marketingEmails'
    };
    const prefKey = prefMap[options.type];
    if (prefKey && options.user.emailPreferences && !options.user.emailPreferences[prefKey]) {
      console.log(`Skipping email of type ${options.type} for user ${options.user.email} due to preferences.`);
      return;
    }
  }

  // Handle password resets which are always allowed if initiated
  if (options.type === 'password-reset') {
    // Always send
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let html = options.html;
  if (options.template) {
    const templatePath = path.join(__dirname, '../views/emails', `${options.template}.ejs`);
    html = await ejs.renderFile(templatePath, options.templateData || {});
  }

  const message = {
    from: `${process.env.COMPANY_NAME} <${process.env.NOREPLY_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: html
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
