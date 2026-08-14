const nodemailer = require('nodemailer');

let transporter;

const initializeTransporter = async () => {
  if (process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
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
    if (!transporter) {
      await initializeTransporter();
    }

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
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
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

const sendOrderConfirmationEmail = async (email, order) => {
  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${order.orderNumber} - MJR CART`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Order Confirmed!</h2>
        <p>Thank you for shopping with MJR CART. Your order <strong>${order.orderNumber}</strong> has been successfully placed.</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p>You can track your order status in your account dashboard.</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendVendorNewOrderEmail = async (email, orderNumber, vendorTotal) => {
  await sendEmail({
    to: email,
    subject: `New Order Received - ${orderNumber} - MJR CART`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">You have a new order!</h2>
        <p>Great news! You have received a new order (<strong>${orderNumber}</strong>).</p>
        <p><strong>Your Revenue for this order:</strong> ₹${vendorTotal}</p>
        <p>Please log in to your vendor dashboard to fulfill this order.</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendOrderStatusUpdateEmail = async (email, orderNumber, status) => {
  await sendEmail({
    to: email,
    subject: `Order Status Update - ${orderNumber} - MJR CART`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Order Status: ${status}</h2>
        <p>Your order <strong>${orderNumber}</strong> is now marked as <strong>${status}</strong>.</p>
        <p>Log in to your account for more details and tracking information.</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendProductApprovalEmail = async (email, productName) => {
  await sendEmail({
    to: email,
    subject: `Product Approved - ${productName} - MJR CART`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Product Approved</h2>
        <p>Your product <strong>${productName}</strong> has been approved by our team and is now live on the marketplace!</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendProductRejectionEmail = async (email, productName) => {
  await sendEmail({
    to: email,
    subject: `Product Requires Update - ${productName} - MJR CART`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c62828;">Product Update Required</h2>
        <p>Your product <strong>${productName}</strong> has been reviewed and requires updates before it can go live.</p>
        <p>Please check your vendor dashboard for more details.</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendPayoutProcessedEmail = async (email, amount, referenceId) => {
  await sendEmail({
    to: email,
    subject: `Payout Processed - MJR CART`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2e7d32;">Payout Processed successfully!</h2>
        <p>We have successfully processed a payout of <strong>₹${amount}</strong> to your registered account.</p>
        <p><strong>Reference ID:</strong> ${referenceId}</p>
        <hr>
        <p style="color: #666;">MJR CART - Multi-Vendor Marketplace</p>
      </div>
    `,
  });
};

const sendNewVendorApplicationEmail = async (adminEmail, storeName, vendorEmail) => {
  await sendEmail({
    to: adminEmail,
    subject: `New Vendor Application - ${storeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">New Vendor Application</h2>
        <p>A new vendor has applied to join the marketplace.</p>
        <p><strong>Store Name:</strong> ${storeName}</p>
        <p><strong>Vendor Email:</strong> ${vendorEmail}</p>
        <p>Please log in to the admin dashboard to review and approve/reject their application.</p>
        <hr>
        <p style="color: #666;">MJR CART - Admin Notifications</p>
      </div>
    `,
  });
};

const sendSupportTicketEmail = async (adminEmail, ticket) => {
  await sendEmail({
    to: adminEmail,
    subject: `New Support Ticket: ${ticket.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">New Contact Form Submission</h2>
        <p><strong>From:</strong> ${ticket.name} (${ticket.email})</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 15px;">
          <p style="white-space: pre-wrap; margin: 0;">${ticket.message}</p>
        </div>
        <hr style="margin-top: 20px;">
        <p style="color: #666;">MJR CART - Admin Notifications</p>
      </div>
    `,
  });
};

module.exports = { 

  sendOtpEmail, 
  sendVendorApprovalEmail, 
  sendVendorRejectionEmail, 
  sendVendorCredentialsEmail,
  sendOrderConfirmationEmail,
  sendVendorNewOrderEmail,
  sendOrderStatusUpdateEmail,
  sendProductApprovalEmail,
  sendProductRejectionEmail,
  sendPayoutProcessedEmail,
  sendNewVendorApplicationEmail,
  sendSupportTicketEmail
};
