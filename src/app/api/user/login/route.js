import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { UserModal } from "../../../../../modals/users.js";

export async function POST(req) {
    const response = { status: "error", message: "Something went wrong", data: {}, error: "Something went wrong" };
    try {
        await connectToDatabase();
        const { email, password } = await req.json();

        if (!email || !password) {
            response.message = "Email and password are required for login.";
            return NextResponse.json(response, { status: 400 });
        }

        // Find user by email or phone
        const user = await UserModal.findOne({ email: email });

        if (!user) {
            response.message = "Invalid credentials.";
            return NextResponse.json(response, { status: 401 });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            response.message = "Your account has been blocked. Please contact support.";
            return NextResponse.json(response, { status: 403 }); // 403 Forbidden for blocked users
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            response.message = "Invalid credentials.";
            return NextResponse.json(response, { status: 401 });
        }

        user.isLoggedIn = true;
        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            { _id: user._id, type: user.type },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        response.status = "success";
        response.message = "Login successful";
        response.error = "";
        response.data = { token, userId: user.userId, email: user.email, name: user.name, type: user.type };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Login error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 