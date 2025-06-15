import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { UserModal } from "../../../../../modals/users.js";
import { verifyToken } from "../../../../../middlewares/auth.js";
import bcrypt from "bcryptjs";

export async function PUT(req) {
    const response = {
        status: "error",
        message: "Something went wrong",
        data: {},
        error: "Something went wrong"
    };

    try {
        await connectToDatabase();

        let decodedToken;
        try {
            decodedToken = await verifyToken(req);
        } catch (err) {
            response.message = err.message;
            return NextResponse.json(response, { status: 401 });
        }

        const userId = decodedToken._id;
        const { oldPaymentPassword, newPaymentPassword, confirmNewPaymentPassword } = await req.json();

        // Validate required fields
        if (!oldPaymentPassword || !newPaymentPassword || !confirmNewPaymentPassword) {
            response.message = "All payment password fields are required.";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate new payment password match
        if (newPaymentPassword !== confirmNewPaymentPassword) {
            response.message = "New payment password and confirm new payment password do not match.";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate new payment password length
        if (newPaymentPassword.length < 8) {
            response.message = "New payment password must be at least 8 characters long.";
            return NextResponse.json(response, { status: 400 });
        }

        const user = await UserModal.findById(userId);
        if (!user) {
            response.message = "User not found.";
            return NextResponse.json(response, { status: 404 });
        }

        // Verify old payment password
        const isPaymentPasswordMatch = await bcrypt.compare(oldPaymentPassword, user.paymentPassword);
        if (!isPaymentPasswordMatch) {
            response.message = "Incorrect old payment password.";
            return NextResponse.json(response, { status: 401 });
        }

        // Assign new payment password to user object (will be hashed by pre-save hook)
        user.paymentPassword = newPaymentPassword;
        await user.save();

        response.status = "success";
        response.message = "Payment password updated successfully.";
        response.error = "";
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Update Payment Password API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 