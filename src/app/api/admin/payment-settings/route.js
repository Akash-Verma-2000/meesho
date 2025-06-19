import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { PaymentSettingsModal } from "../../../../../modals/settings.js";
import { verifyToken } from "../../../../../middlewares/auth.js";

export async function POST(req) {
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

        // Ensure only admin users can access this API
        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can upload payment settings.";
            return NextResponse.json(response, { status: 403 });
        }

        const { qrCodeBase64, payTmLink, googlePayLink, phonePayLink } = await req.json();

        // Find and update the single settings document, or create if it doesn't exist
        const filter = {}; // Empty filter to match the single document
        const update = { qrCodeBase64 };
        if (payTmLink !== undefined) update.payTmLink = payTmLink;
        if (googlePayLink !== undefined) update.googlePayLink = googlePayLink;
        if (phonePayLink !== undefined) update.phonePayLink = phonePayLink;
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        const updatedSettings = await PaymentSettingsModal.findOneAndUpdate(filter, update, options);

        response.status = "success";
        response.message = "Payment settings updated successfully.";
        response.error = "";
        response.data = updatedSettings;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.log("Admin Payment Settings API error (POST):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}

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

        // Ensure only admin users can access this API
        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can view payment settings.";
            return NextResponse.json(response, { status: 403 });
        }

        const settings = await PaymentSettingsModal.findOne({});

        if (!settings) {
            response.status = "success"; // No settings found, but it's not an error
            response.message = "No payment settings found.";
            response.error = "";
            response.data = { qrCodeBase64: null }; // Return null for QR code if not found
            return NextResponse.json(response, { status: 200 });
        }

        response.status = "success";
        response.message = "Payment settings fetched successfully.";
        response.error = "";
        response.data = settings;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Admin Payment Settings API error (GET):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 