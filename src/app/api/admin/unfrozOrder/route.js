import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../configurations/mongoose.config.js';
import { UserModal } from '../../../../../modals/users.js';

export async function POST(req) {
    const response = {
        status: 'error',
        message: 'Something went wrong',
        data: {},
        error: 'Something went wrong',
    };
    try {
        await connectToDatabase();
        const { _id } = await req.json();
        if (!_id) {
            response.message = 'User _id is required';
            return NextResponse.json(response, { status: 400 });
        }
        const user = await UserModal.findById(_id);
        if (!user) {
            response.message = 'User not found';
            return NextResponse.json(response, { status: 404 });
        }
        user.lastOrderGrabbedAt = new Date();
        await user.save();
        response.status = 'success';
        response.message = 'Order unfrozed successfully.';
        response.data = { _id: user._id, lastOrderGrabbedAt: user.lastOrderGrabbedAt };
        response.error = '';
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        response.error = error.message;
        return NextResponse.json(response, { status: 500 });
    }
} 