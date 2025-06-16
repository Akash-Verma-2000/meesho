import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config";
import { UserModal } from "../../../../../modals/users.js";
import { createDocKey } from "@/utils/utility";
import bcrypt from "bcryptjs";


export async function POST(req) {
    const response = { status: "error", message: "Something went wrong", data: {}, error: "Something went wrong" };
    try {
        await connectToDatabase();
        const { sponsorId, name, phone, email, password, paymentPassword } = await req.json();

        console.log("REQUEST BODY =>", sponsorId, name, phone, email, password, paymentPassword);

        // Basic validation for request body fields
        if (!name || !phone || !email || !password || !paymentPassword) {
            response.message = "All fields are required: name, phone, email, password, paymentPassword";
            return NextResponse.json(response, { status: 400 });
        }

        // Email format validation (basic regex, more robust validation should be in schema/model)
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            response.message = "Please enter a valid email address";
            return NextResponse.json(response, { status: 400 });
        }

        // Phone number format validation (basic regex, assuming 10 digits for Indian numbers)
        if (!/^[6-9]\d{9}$/.test(phone)) {
            response.message = "Please enter a valid 10-digit Indian phone number starting with 6-9";
            return NextResponse.json(response, { status: 400 });
        }

        // Password length validation
        if (password.length < 8) {
            response.message = "Password must be at least 8 characters long";
            return NextResponse.json(response, { status: 400 });
        }

        // Payment password length validation
        if (paymentPassword.length < 8) {
            response.message = "Payment password must be at least 8 characters long";
            return NextResponse.json(response, { status: 400 });
        }

        // Check if email or phone already exists
        const existingUser = await UserModal.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            response.message = "User with this email or phone number already exists";
            return NextResponse.json(response, { status: 409 }); // Conflict
        }

        if (!sponsorId) {
            response.message = "Sponsor ID is required";
            return NextResponse.json(response, { status: 400 });
        }

        let sponsor = null;
        if (sponsorId) {
            sponsor = await UserModal.findOne({ userId: sponsorId, isDeleted: false });
            if (!sponsor) {
                response.message = "Sponsor not found";
                return NextResponse.json(response, { status: 400 });
            }
        }

        const lastUser = await UserModal.findOne({}).sort({ createdAt: -1 });

        // Generate new userId
        let newUserId;
        if (!lastUser) {
            newUserId = "MSH101";
        } else {
            // Extract the number from the last userId and increment it
            const lastNumber = parseInt(lastUser.userId.replace("MSH", ""));
            newUserId = `MSH${lastNumber + 1}`;
        }

        // Hash passwords
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPaymentPassword = await bcrypt.hash(paymentPassword, 10);

        // Create new user
        const newUser = new UserModal({
            userId: newUserId,
            sponsorId: sponsor._id,
            name,
            phone,
            email,
            password: hashedPassword,
            paymentPassword: hashedPaymentPassword,
        });

        response.data = await newUser.save();
        response.status = "success";
        response.message = "User registered successfully";
        response.error = "";
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        response.error = error.message;
        // Mongoose validation errors
        if (error.name === 'ValidationError') {
            response.message = error.message;
            return NextResponse.json(response, { status: 400 });
        }
        return NextResponse.json(response, { status: 500 });
    }
}

