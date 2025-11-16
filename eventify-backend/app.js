const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();

const {
  securityMiddleware,
} = require("./middlewares/security-middleware/security.middleware.js");
const {
  initializeSocket,
} = require("./utilities/socket-utility/socket.utility.js");

const {
  initializeChatSocket,
} = require("./controllers/chat-controller/chat.controller.js");

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

// Initialize chat socket handlers
initializeChatSocket(io);

securityMiddleware(app);
app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

const corsOptions = {
  origin:
    process.env.ALLOWED_ORIGINS === "*"
      ? true
      : process.env.ALLOWED_ORIGINS.split(","),
  credentials: true,
  optionsSuccessStatus: 201,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGINS || "*"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Content-Type-Options"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// ==================== BASE API ROUTES ====================
const superAdminRoute = require("./routes/super-admin-route/super-admin.route.js");
const userRoute = require("./routes/user-route/user.route.js");
const organizerRoute = require("./routes/organizer-route/organizer.route.js");
const eventRoute = require("./routes/event-route/event.route.js");
const ticketRoute = require("./routes/ticket-route/ticket.route.js");

// ==================== API MIDDLEWARES ====================
app.use("/api/super-admin", superAdminRoute);
app.use("/api/user", userRoute);
app.use("/api/organizer", organizerRoute);
app.use("/api/event", eventRoute);
app.use("/api/ticket", ticketRoute);

// ==================== SERVER MIDDLEWARES ====================

app.get("/api/health", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Server is running healthy",
    timestamp: new Date().toISOString(),
  });
});

// ==================== SERVER STARTING ENDPOINT ====================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BACKEND IS RUNNING",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

module.exports = app;
