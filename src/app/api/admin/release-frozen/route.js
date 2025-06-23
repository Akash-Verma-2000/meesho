import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config";
import { UserModal } from "../../../../../modals/users";

export async function PUT(req) {
    try {
        await connectToDatabase();
        const { _id } = await req.json();
        if (!_id) {
            return NextResponse.json({ status: "error", message: "User _id is required" }, { status: 400 });
        }
        const user = await UserModal.findById(_id);
        if (!user) {
            return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
        }
        user.balance = user.frozenBalance;
        user.frozenBalance = 0;
        await user.save();
        return NextResponse.json({ status: "success", message: "Frozen balance released successfully", data: { balance: user.balance } }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
} 