// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
import connectionDB from "./db/index.js";

dotenv.config();

connectionDB();

/*
import express from "express";
const app = express();

(async () => {
  try {
    // console.log(process.env.MONGO_URL);
    const connection = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`
    );
    console.log("Connected to DB");
    console.log(DB_NAME);
    app.on("error", (error) => {
      console.log("ERRR" + error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log("Server started on port " + process.env.PORT);
    });
  } catch (error) {
    console.log(DB_NAME);
    console.log(error);
  }
})();
*/
