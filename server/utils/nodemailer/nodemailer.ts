import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: parseInt(process.env.SMTP_PORT || "587"),
	secure: process.env.SMTP_PORT === "465",
	auth: {
		user: process.env.SMTP_USER, // Your email address
		pass: process.env.SMTP_PASS, // Your app password
	},
});

export const generateOTP = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

export const otpexpiresAt = (minutes: number): Date => {
	return new Date(Date.now() + minutes * 60 * 1000);
};

export const sendOTPEmail = async (email: string, otp: string) => {
	await transporter.sendMail({
		from: process.env.SMTP_USER,
		to: email,
		subject: "Your OTP Code",
		html: `
			<div style="font-family: sans-serif; padding: 20px; color: #333;">
				<h2>Verify Your Email</h2>
				<p>Your OTP verification code is:</p>
				<h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 2px;">${otp}</h1>
				<p>This code is valid for <strong>5 minutes</strong>.</p>
			</div>
		`,
	});
};
