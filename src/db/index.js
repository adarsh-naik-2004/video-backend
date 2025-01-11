import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionDetails = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        console.log(`Mongodb connected DB host: ${connectionDetails.connection.host}`)
    }
    catch (error) {
        console.log("MongoDB Connection error", error)
        process.exit(1)
    }
}

export default connectDB