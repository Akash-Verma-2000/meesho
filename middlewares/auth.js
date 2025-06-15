import jwt from 'jsonwebtoken';
import { UserModal } from '../modals/users.js'; // Import the UserModal

export async function verifyToken(req) {
    try {
        const token = req.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user to check isBlocked status
        const user = await UserModal.findById(decoded._id);
        if (!user || user.isBlocked) {
            throw new Error('User is blocked or not found.');
        }

        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
};
