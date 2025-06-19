import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { PaymentSettingsModal } from "../../../../../modals/settings.js";

export async function GET(req) {
    const response = {
        status: "error",
        message: "Something went wrong",
        data: {},
        error: "Something went wrong"
    };

    try {
        await connectToDatabase();

        const settings = await PaymentSettingsModal.findOne({});

        if (!settings) {
            response.status = "success";
            response.message = "No payment settings found.";
            response.error = "";
            response.data = { qrCodeBase64: null };
            return NextResponse.json(response, { status: 200 });
        }

        response.status = "success";
        response.message = "Payment settings fetched successfully.";
        response.error = "";
        response.data = settings
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("User Payment Settings API error (GET):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 