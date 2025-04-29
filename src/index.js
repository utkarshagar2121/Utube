// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
import connectionDB from "./db/index.js";
import app from "./app.js";

dotenv.config();

connectionDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log("Server started on port " + process.env.PORT);  
    })
})
.catch((err)=>{
    console.log("Error while Promise: "+err);
})