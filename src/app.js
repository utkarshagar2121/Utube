import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({ 
    extended: true,
    limit: "16kb",
  }) // We use this to parse urlencoded data from the client url
);
app.use(express.static("public")); // We use this to serve static files
app.use(cookieParser());

export default app;
