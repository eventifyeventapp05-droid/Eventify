const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

/**
 * @function initializeSocket
 * @description Initializes Socket.IO server with JWT authentication
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/", // Explicit path for Vercel
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    cookie: false,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      console.log("Socket connection attempt:", {
        headers: socket.handshake.headers,
        auth: socket.handshake.auth,
        query: socket.handshake.query,
      });

      // Get token from multiple possible locations
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        console.log("No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully:", {
        userId: decoded.user?.id,
        role: decoded.role,
      });

      if (!decoded?.user?.id || !decoded?.role) {
        console.log("Invalid token structure:", decoded);
        return next(new Error("Authentication error: Invalid token structure"));
      }

      // Attach user info to socket
      socket.user = {
        id: decoded.user.id,
        role: decoded.role,
        email: decoded.user.email,
        sessionId: decoded.sessionId,
      };

      console.log(
        `Socket authenticated for user: ${socket.user.id}, role: ${socket.user.role}`
      );
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);

      if (error.name === "TokenExpiredError") {
        return next(new Error("Authentication failed: Token expired"));
      } else if (error.name === "JsonWebTokenError") {
        return next(new Error("Authentication failed: Invalid token"));
      } else {
        return next(new Error("Authentication failed: " + error.message));
      }
    }
  });

  // Connection event
  io.on("connection", (socket) => {
    console.log(
      `User ${socket.user.id} connected with socket ID: ${socket.id}`
    );

    // Join user to their personal room
    if (socket.user?.id) {
      socket.join(socket.user.id);
      console.log(`User ${socket.user.id} joined room: ${socket.user.id}`);
    }

    // Join role-based rooms
    socket.join(socket.user.role.toLowerCase());

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(
        `User ${socket.user?.id} disconnected. Reason: ${reason}, Socket ID: ${socket.id}`
      );
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user?.id}:`, error);
    });

    // Test event
    socket.on("ping", (data) => {
      console.log("Ping received from user:", socket.user.id);
      socket.emit("pong", {
        message: "Server is responsive",
        timestamp: new Date().toISOString(),
        user: socket.user,
      });
    });
  });

  // Handle overall server events
  io.engine.on("connection_error", (err) => {
    console.error("Socket.IO connection error:", err);
  });

  console.log("Socket.IO server initialized successfully");
  return io;
};

/**
 * @function getIo
 * @description Returns the initialized Socket.IO instance
 * @returns {Object} Socket.IO instance
 * @throws {Error} If Socket.IO is not initialized
 */
const getIo = () => {
  if (!io)
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  return io;
};

module.exports = { initializeSocket, getIo };
