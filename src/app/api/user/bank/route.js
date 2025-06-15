import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";

import { verifyToken } from "../../../../../middlewares/auth.js";
import { BankModal } from "../../../../../modals/bank.js";

export async function POST(req) {
    const response = {
        status: "error",
        message: "Something went wrong",
        data: {},
        error: "Something went wrong"
    };

    try {
        await connectToDatabase();

        // Verify JWT token
        let decodedToken;
        try {
            decodedToken = await verifyToken(req);
        } catch (err) {
            response.message = err.message;
            return NextResponse.json(response, { status: 401 });
        }

        const userId = decodedToken._id;
        const {
            accountHolderName,
            bankName,
            branchName,
            accountNumber,
            ifscCode,
            type
        } = await req.json();

        // Validate required fields
        if (!accountHolderName || !bankName || !branchName || !accountNumber || !ifscCode || !type) {
            response.message = "All fields are required.";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate account number format
        if (!/^\d{9,18}$/.test(accountNumber)) {
            response.message = "Please enter a valid account number (9-18 digits).";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate IFSC code format
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
            response.message = "Please enter a valid IFSC code (e.g., ABCD0123456).";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate bank account type
        if (type !== 'savings' && type !== 'current') {
            response.message = "Invalid bank account type. Must be 'savings' or 'current'.";
            return NextResponse.json(response, { status: 400 });
        }

        // Prepare the bank details object
        const bankDetailsData = {
            accountHolderName,
            bankName,
            branchName,
            accountNumber,
            ifscCode: ifscCode.toUpperCase(),
            type
        };

        let savedData;
        const existing = await BankModal.findOne({ userId });

        if (existing) {
            // Update existing bank details
            savedData = await BankModal.findOneAndUpdate(
                { userId },
                { $set: bankDetailsData },
                { new: true, runValidators: true }
            );
            response.status = "success";
            response.message = "Bank details updated successfully.";
            response.data = savedData;
            return NextResponse.json(response, { status: 200 }); // 200 OK for update
        } else {
            // Create new bank details
            const newBankDetails = new BankModal({
                userId,
                ...bankDetailsData
            });
            savedData = await newBankDetails.save();
            response.status = "success";
            response.message = "Bank details saved successfully.";
            response.data = savedData;
            return NextResponse.json(response, { status: 201 }); // 201 Created for new entry
        }

    } catch (error) {
        console.error("Save Bank Details API error:", error);
        response.error = error.message;
        if (error.name === "ValidationError") {
            response.message = error.message;
            return NextResponse.json(response, { status: 400 });
        }
        return NextResponse.json(response, { status: 500 });
    }
}

export async function GET(req) {
    const response = { status: "error", message: "Something went wrong", data: {}, error: "Something went wrong" };
    try {
        await connectToDatabase();

        let decodedToken;
        try {
            decodedToken = await verifyToken(req);
        } catch (err) {
            response.message = err.message;
            return NextResponse.json(response, { status: 401 });
        }

        const userId = decodedToken._id; // Get userId from JWT token

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
        console.error("Fetch Bank Details API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}
