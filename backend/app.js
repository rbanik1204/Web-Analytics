import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import logger from "./middlewares/logger.js";
import globalError from "./middlewares/globalError.js";
import { router as eventRouter } from "./routes/event.routes.js";
import { router as homeRouter } from "./routes/home.routes.js";
const app = express();
dotenv.config({
  override: true,
  silent: true,
  quite: true,
});
//HTTP method & requested url Logger Middleware
app.use(logger);

//Built-in middlewares
app.use(express.json()); // ReadableStream `json` to Object
app.use(express.urlencoded({ extended: false })); //if form data fetch the ReadableStream and parse it from form data to Object

//ESM work around __dirname doesnt exist
const __filename = fileURLToPath(import.meta.url); //path of the current file that along with app.js
const __dirname = path.dirname(__filename); //gives the exact path by stripping file name

//serve the public directory
app.use(express.static(path.join(__dirname, "public"))); //theres no prefix to strip
// Serve the tracker directory.
app.use("/tracker", express.static(path.resolve(__dirname, "../tracker")));
app.set("views", path.join(__dirname, "./views")); //or use .resolve(__dirname,'views')
//Set template engine (.ejs,.pug,.jade)
app.set("view engine", "ejs");

//CORS
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://causal-funnel-analytics-kyr76hxfv-ratul-baniks-projects.vercel.app",
  "https://causal-funnel-analytics-o9naivxce-ratul-baniks-projects.vercel.app/",
  "https://causal-funnel-analytics-1-wxnm.onrender.com/",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
//Routes

app.use("/api", eventRouter);
app.use("/", homeRouter);
//Global Error Middleware
app.use(globalError);
export { app };
