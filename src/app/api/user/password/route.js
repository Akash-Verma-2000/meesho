import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { UserModal } from "../../../../../modals/users.js";
import { verifyToken } from "../../../../../middlewares/auth.js";

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
        const { oldPassword, newPassword, confirmNewPassword } = await req.json();

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            response.message = "All password fields are required.";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate new password match
        if (newPassword !== confirmNewPassword) {
            response.message = "New password and confirm new password do not match.";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate new password length
        if (newPassword.length < 8) {
            response.message = "New password must be at least 8 characters long.";
            return NextResponse.json(response, { status: 400 });
        }

        const user = await UserModal.findById(userId);
        if (!user) {
            response.message = "User not found.";
            return NextResponse.json(response, { status: 404 });
        }

        // Verify old password
        if (oldPassword != user.password) {
            response.message = "Incorrect old password.";
            return NextResponse.json(response, { status: 401 });
        }

        // Assign new password to user object (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        response.status = "success";
        response.message = "Password updated successfully.";
        response.error = "";
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Update Password API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 