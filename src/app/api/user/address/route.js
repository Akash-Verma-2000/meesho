import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { verifyToken } from "../../../../../middlewares/auth.js";
import { AddressModal } from "../../../../../modals/address.js";

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

        const userId = decodedToken._id;
        const {
            country,
            state,
            city,
            pinCode,
            addressLine1,
            addressLine2
        } = await req.json();

        // Validate required fields
        if (!country || !state || !city || !pinCode || !addressLine1) {
            response.message = "Country, state, city, PIN code, and Address Line 1 are required.";
            return NextResponse.json(response, { status: 400 });
        }

        // Validate PIN code format
        if (!/^[0-9]{6}$/.test(pinCode)) {
            response.message = "Please enter a valid 6-digit PIN code.";
            return NextResponse.json(response, { status: 400 });
        }

        const addressData = {
            country,
            state,
            city,
            pinCode,
            addressLine1,
            addressLine2
        };

        let savedData;
        const existingAddress = await AddressModal.findOne({ userId });

        if (existingAddress) {
            // Update existing address details
            savedData = await AddressModal.findOneAndUpdate(
                { userId },
                { $set: addressData },
                { new: true, runValidators: true }
            );
            response.status = "success";
            response.message = "Address updated successfully.";
            response.data = savedData;
            return NextResponse.json(response, { status: 200 });
        } else {
            // Create new address details
            const newAddress = new AddressModal({
                userId,
                ...addressData
            });
            savedData = await newAddress.save();
            response.status = "success";
            response.message = "Address saved successfully.";
            response.data = savedData;
            return NextResponse.json(response, { status: 201 });
        }

    } catch (error) {
        console.error("Address API error (POST):", error);
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

        const userId = decodedToken._id;
        const addressDetails = await AddressModal.findOne({ userId });

        if (!addressDetails) {
            response.message = "Address details not found for this user.";
            return NextResponse.json(response, { status: 404 });
        }

        response.status = "success";
        response.message = "Address details fetched successfully.";
        response.error = "";
        response.data = addressDetails;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Address API error (GET):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 