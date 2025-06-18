import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { verifyToken } from "../../../../../middlewares/auth.js";
import { BankModal } from "../../../../../modals/bank.js";

export async function GET(req) {
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

        // Only allow admin users
        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can view user bank details.";
            return NextResponse.json(response, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) {
            response.message = "User ID is required.";
            return NextResponse.json(response, { status: 400 });
        }

        const bankDetails = await BankModal.findOne({ userId });
        if (!bankDetails) {
            response.message = "Bank details not found for this user.";
            return NextResponse.json(response, { status: 404 });
        }

        response.status = "success";
        response.message = "Bank details fetched successfully.";
        response.error = "";
        response.data = bankDetails;
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Admin Fetch User Bank Details API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 