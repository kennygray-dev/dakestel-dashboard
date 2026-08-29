import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Don't kill the process: the HTTP server stays up so the frontend can
    // load and requests fail individually instead of the whole API dying.
    console.error("MongoDB Connection Error:", error);
    console.error(
      "Server is running WITHOUT a database connection. " +
        "Check MONGO_URI in backend/.env; requests that hit the database will fail."
    );

    // Without this, Mongoose queues queries and each request hangs for
    // bufferTimeoutMS before erroring. Fail immediately instead.
    mongoose.set("bufferCommands", false);
  }
};

export default connectDB;
