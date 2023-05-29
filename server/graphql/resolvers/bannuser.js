import React from 'react';
import nodemailer from 'nodemailer';

const sendEmail = async () => {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configure your email provider settings here
      // Example: SMTP settings for Gmail
      service: 'Gmail',
      auth: {
        user: 'steven30gold111@gmail.com',
        pass: 'notmypassword',
      },
    });

    // Compose the email message
    const mailOptions = {
      from: 'steven30gold111@gmail.com',
      to: 'stefancampan@gmail.com',
      subject: 'From StackBetterFLOW',
      text: 'Sorry you got banned!',
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const EmailButton = ({ loading }) => {
  const handleClick = () => {
    sendEmail();
  };

  return (
    <Button
      color="primary"
      variant="contained"
      size="large"
      fullWidth
      startIcon={<ExitToAppIcon />}
      type="submit"
      disabled={loading}
      onClick={handleClick}
    >
      Log In
    </Button>
  );
};

export default EmailButton;
