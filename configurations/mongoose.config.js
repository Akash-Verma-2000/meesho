import mongoose from "mongoose";

let isConnected = false;

export default async function connectToDatabase() {
    try {
        if (isConnected) return;
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("Database Connected");
    } catch (err) {
        console.log("ERROR IN DATABASE CONNECTION =>", err);
        console.log("Failed to connect with DB");
    }
}


