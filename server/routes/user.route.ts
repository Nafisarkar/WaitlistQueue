import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/db";
import { otpTable, usersTable } from "../db/schema";
import {
	generateOTP,
	otpexpiresAt,
	sendOTPEmail,
} from "../utils/nodemailer/nodemailer";

const userRoute = new Hono();

userRoute
	.get("/", async (c) => {
		try {
			const allVisitors = await db.select().from(usersTable).all();
			if (allVisitors.length === 0) {
				return c.json({
					visitor: false,
				});
			}

			return c.json({
				visitor: true,
				data: allVisitors,
			});
		} catch (error) {
			console.error("Error fetching visitors:", error);
			return c.json(
				{
					success: false,
					message: "Failed to fetch visitor information.",
				},
				500,
			);
		}
	})
	.post("/register", async (c) => {
		try {
			const { email } = await c.req.json();

			if (!email) {
				return c.json(
					{
						success: false,
						message: "Email is required.",
					},
					400,
				);
			}

			const existingUser = await db
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, email))
				.get();

			if (existingUser?.isVerified) {
				return c.json(
					{
						success: false,
						message: "Email already registered and verified.",
					},
					409,
				);
			}

			if (!existingUser) {
				await db.insert(usersTable).values({
					email,
					isVerified: false,
				});
			}

			const alredySentOTP = await db
				.select()
				.from(otpTable)
				.where(eq(otpTable.email, email))
				.get();

			if (new Date(alredySentOTP?.expiry_time || 0) > new Date()) {
				return c.json(
					{
						success: false,
						message: `An OTP has already been sent to ${email}. Please check your email or wait for the OTP to expire before requesting a new one.`,
					},
					429,
				);
			}

			const otp = generateOTP();
			const expiresAt = otpexpiresAt(5); // OTP valid for 5 minutes

			await db.delete(otpTable).where(eq(otpTable.email, email));
			await db.insert(otpTable).values({
				email,
				otp,
				expiry_time: expiresAt.toISOString(),
			});

			await sendOTPEmail(email, otp);

			return c.json({
				success: true,
				message: `Registration successful ! Verification OTP sent to ${email}`,
			});
		} catch (error) {
			return c.json(
				{
					success: false,
					message: "Registration failed. Please try again.",
					error,
				},
				500,
			);
		}
	})
	.post("/verify", async (c) => {
		try {
			const { email, otp } = await c.req.json();

			if (!email || !otp) {
				return c.json(
					{
						success: false,
						message: "Email and OTP are required.",
					},
					400,
				);
			}

			const otpRecord = await db
				.select()
				.from(otpTable)
				.where(eq(otpTable.email, email))
				.get();

			if (!otpRecord) {
				return c.json(
					{
						success: false,
						message: "No OTP found for this email. Please register again.",
					},
					404,
				);
			}

			if (otpRecord.otp !== otp) {
				return c.json(
					{
						success: false,
						message: "Invalid OTP. Please try again.",
					},
					400,
				);
			}

			if (new Date(otpRecord.expiry_time) < new Date()) {
				return c.json(
					{
						success: false,
						message: "OTP has expired. Please register again.",
					},
					400,
				);
			}

			await db
				.update(usersTable)
				.set({
					isVerified: true,
				})
				.where(eq(usersTable.email, email));

			await db.delete(otpTable).where(eq(otpTable.email, email));

			return c.json({
				success: true,
				message: `${email} verified successfully ! You are now on the waitlist.`,
			});
		} catch (error) {
			return c.json(
				{
					success: false,
					message: "Verification failed. Please try again.",
					error,
				},
				500,
			);
		}
	});

export default userRoute;
