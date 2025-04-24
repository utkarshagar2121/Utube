import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config();

const connectionDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`
    );
    console.log("MongoDb Connected!");
    console.log("DB Host: " + connectionInstance.connection.host);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectionDB;
