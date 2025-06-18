import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { UserModal } from "../../../../../modals/users.js"; // Assuming admin users are also in UserModal with a 'type' field
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    const response = {
        status: "error",
        message: "Something went wrong",
        data: {},
        error: "Something went wrong"
    };

    try {
        await connectToDatabase();

        const { email, password } = await req.json();

        // Validate required fields
        if (!email || !password) {
            response.message = "Email and password are required.";
            return NextResponse.json(response, { status: 400 });
        }

        // Find the admin user by email and ensure they are of type 'admin' and not deleted/blocked
        const user = await UserModal.findOne({ email: email, type: 'admin', isDeleted: false, isBlocked: false });

        if (!user) {
            response.message = "Invalid credentials.";
            return NextResponse.json(response, { status: 401 });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            response.message = "Invalid credentials.";
            return NextResponse.json(response, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            { _id: user._id, type: user.type },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        response.status = "success";
        response.message = "Admin logged in successfully.";
        response.data = { token: token };
        response.error = "";
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.log("Admin Login API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}