import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { TransactionNodal } from "../../../../../modals/transactions.js";
import { UserModal } from "../../../../../modals/users.js";
import { verifyToken } from "../../../../../middlewares/auth.js";

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
            response.message = "Unauthorized access. Only admins can view withdrawal reports.";
            return NextResponse.json(response, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const statusFilter = searchParams.get('status'); // Optional status filter

        let query = { type: 'withdraw' };
        if (statusFilter) {
            query.status = statusFilter;
        }

        const skip = (page - 1) * limit;

        const totalWithdrawals = await TransactionNodal.countDocuments(query);
        const withdrawals = await TransactionNodal.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'userId');

        // Optionally populate user details if needed for the report
        // .populate('userId', 'name email phone'); 

        response.status = "success";
        response.message = "Withdrawal reports fetched successfully.";
        response.error = "";
        response.data = {
            withdrawals: withdrawals,
            currentPage: page,
            totalPages: Math.ceil(totalWithdrawals / limit),
            totalWithdrawals: totalWithdrawals,
        };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Withdrawal Report API error (GET):", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
}

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

        // Ensure only admin users can access this API
        if (decodedToken.type !== 'admin') {
            response.message = "Unauthorized access. Only admins can update transaction status.";
            return NextResponse.json(response, { status: 403 });
        }

        const { transactionId, status } = await req.json();

        if (!transactionId || !['pending', 'approved', 'rejected'].includes(status)) {
            response.message = "Transaction ID and a valid status (pending, approved, or rejected) are required.";
            return NextResponse.json(response, { status: 400 });
        }

        const transaction = await TransactionNodal.findById(transactionId);

        if (!transaction) {
            response.message = "Transaction not found.";
            return NextResponse.json(response, { status: 404 });
        }

        // Check if transaction is in pending status
        if (transaction.status !== 'pending') {
            response.message = "Only pending transactions can be updated.";
            return NextResponse.json(response, { status: 400 });
        }

        // Update transaction status
        transaction.status = status;
        const updatedTransaction = await transaction.save();

        // If transaction is approved, deduct from user's balance
        if (status === 'approved' && transaction.type === 'withdraw') {
            const user = await UserModal.findById(transaction.userId);
            if (user) {
                user.balance -= transaction.amount;
                await user.save();
            }
        } else if (status === 'rejected' && transaction.type === 'withdraw') {
            // If withdrawal is rejected, refund the amount to the user's balance
            const user = await UserModal.findById(transaction.userId);
            if (user) {
                user.balance += transaction.amount;
                await user.save();
            }
        }

        response.status = "success";
        response.message = "Transaction status updated successfully.";
        response.error = "";
        response.data = updatedTransaction;
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Withdrawal Report API error (PUT):", error);
        response.error = error.message;
        if (error.name === 'ValidationError') {
            response.message = error.message;
            return NextResponse.json(response, { status: 400 });
        }
        return NextResponse.json(response, { status: 500 });
    }
} 