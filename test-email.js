require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.yopmail.com',
  port: 25,
  secure: false,
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: 'garuda.test106@gmail.com',
  to: 'rajesh.kumar@yopmail.com',
  subject: 'Test Email Direct Delivery',
  text: 'If you see this, direct SMTP delivery works!'
}, (err, info) => {
  if (err) console.error(err);
  else console.log('Success:', info.response);
});
