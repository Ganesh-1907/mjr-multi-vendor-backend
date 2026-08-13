const nodemailer = require('nodemailer');

let transporter;

const initializeTransporter = async () => {
  if (process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to ethereal email for dev/staging
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[EMAIL] Using Ethereal test SMTP account');
  }
};

initializeTransporter();

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Wait for transporter to initialize if it hasn't already
    if (!transporter) await initializeTransporter();
    
    const info = await transporter.sendMail({
      from: `"MJR CART" <${process.env.EMAIL_FROM || 'noreply@mjrcart.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[EMAIL PREVIEW URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

const sendOtpEmail = async (email, otp, purpose = 'signup') => {
  const subject = purpose === 'forgot'
    ? 'Password Reset OTP - MJR CART'
    : 'Email Verification OTP - MJR CART';

  await sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">${purpose === 'forgot' ? 'Password Reset' : 'Email Verification'}</h2>
        <p>Your OTP is: <strong style="font-size: 24px; color: #1a237e;">${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendVendorApprovalEmail = async (email, storeName) => {
  await sendEmail({
    to: email,
    subject: 'Vendor Application Approved - MJR CART',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Congratulations!</h2>
        <p>Your vendor application for <strong>${storeName}</strong> has been approved!</p>
        <p>You can now start listing your products and selling on MJR CART.</p>
        <p><a href="http://localhost:4200/vendor/dashboard" 
              style="background: #1a237e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Go to Dashboard</a></p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendVendorRejectionEmail = async (email, storeName, reason) => {
  await sendEmail({
    to: email,
    subject: 'Vendor Application Update - MJR CART',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c62828;">Application Not Approved</h2>
        <p>We regret to inform you that your vendor application for <strong>${storeName}</strong> could not be approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>You may reapply after addressing the above concerns.</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendVendorCredentialsEmail = async (email, password, storeName) => {
  await sendEmail({
    to: email,
    subject: 'Vendor Account Created - MJR CART',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Vendor Account Created</h2>
        <p>Your vendor account for <strong>${storeName}</strong> has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
        <p>Please log in and change your password.</p>
        <p><a href="http://localhost:4200/auth/login" 
              style="background: #1a237e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Login Now</a></p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail, sendVendorApprovalEmail, sendVendorRejectionEmail, sendVendorCredentialsEmail };
