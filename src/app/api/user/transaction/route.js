import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../configurations/mongoose.config.js";
import { TransactionNodal } from "../../../../../modals/transactions.js";
import { UserModal } from "../../../../../modals/users.js";
import { verifyToken } from "../../../../../middlewares/auth.js";

export async function POST(req) {
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
        const { type, amount, transactionId, password } = await req.json();

        // Find the user to verify paymentPassword
        const user = await UserModal.findById(userId);
        if (!user) {
            response.message = "User not found.";
            return NextResponse.json(response, { status: 404 });
        }

        // Verify payment password
        if (!password) {
            response.message = "Password is required for this transaction.";
            return NextResponse.json(response, { status: 400 });
        }

        if (password!=user.paymentPassword) {
            response.message = "Invalid password.";
            return NextResponse.json(response, { status: 401 });
        }

        // Basic validation for rest of the request body
        if (!type || !amount) {
            response.message = "Transaction type and amount are required.";
            return NextResponse.json(response, { status: 400 });
        }

        if (type !== 'recharge' && type !== 'withdraw') {
            response.message = "Invalid transaction type. Must be 'recharge' or 'withdraw'.";
            return NextResponse.json(response, { status: 400 });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            response.message = "Amount must be a positive number.";
            return NextResponse.json(response, { status: 400 });
        }

        if (type === 'recharge' && !transactionId) {
            response.message = "Transaction ID is required for recharge transactions.";
            return NextResponse.json(response, { status: 400 });
        }

        // Handle withdrawal specific logic
        if (type === 'withdraw') {
            if (user.balance < amount) {
                response.message = "Insufficient balance.";
                return NextResponse.json(response, { status: 400 });
            }
            if (user.grabbedOrders && user.grabbedOrders.length >= 4) {
                response.message = "Please contact your customer support";
                return NextResponse.json(response, { status: 400 });
            }
        }

        // Handle recharge specific logic (if applicable, e.g., update user balance only after admin approval)
        // For now, no automatic balance update for recharge at this stage, as per previous interactions

        const newTransaction = new TransactionNodal({
            userId: userId,
            type: type,
            amount: amount,
            transactionId: type === 'recharge' ? transactionId : undefined, // Only store transactionId for recharge
            status: 'pending',
        });

        response.data = await newTransaction.save();
        response.status = "success";
        response.message = "Transaction created successfully";
        response.error = "";
        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        console.error("Transaction API error:", error);
        response.error = error.message;
        if (error.name === 'ValidationError') {
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
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page')) || 1; // Default to page 1
        const limit = parseInt(searchParams.get('limit')) || 10; // Default to 10 transactions per page

        let query = { userId: userId };
        if (type) {
            if (type !== 'recharge' && type !== 'withdraw') {
                response.message = "Invalid transaction type. Must be 'recharge' or 'withdraw'.";
                return NextResponse.json(response, { status: 400 });
            }
            query.type = type;
        }

        const skip = (page - 1) * limit;

        const totalTransactions = await TransactionNodal.countDocuments(query);
        const transactions = await TransactionNodal.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        response.status = "success";
        response.message = "Transactions fetched successfully";
        response.error = "";
        response.data = {
            transactions: transactions,
            currentPage: page,
            totalPages: Math.ceil(totalTransactions / limit),
            totalTransactions: totalTransactions,
        };
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Fetch transactions API error:", error);
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 

