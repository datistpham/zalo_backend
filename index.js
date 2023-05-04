const express = require("express");
const mongooes = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SocketServer = require("./SocketServer");
const { ExpressPeerServer } = require("peer");
const swaggerDocument = require('./swagger.json');
// const swaggerUi = require('swagger-ui-express');
const s3 = require("./util/s3");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: "cockbook",
  api_key: "362125891568421",
  api_secret: "kR3bk36ysLWcYuKLy-MN9otXogM",
  secure: true  
});
// const sendSms = require("./util/sendsms");
// const fs = require("fs");
// const path = require("path");

const verifyToken = require("./middleware/auth");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const conversationRouter = require("./routes/conversations");
const messageRouter = require("./routes/messages");
const callRouter= require("./routes/call")
const adminRouter= require("./routes/admin")
const router = require("./routes/auth");
const upload= require("./routes/upload")
const app = express();
app.use(helmet());
app.use(cookieParser());

dotenv.config();
//middleware
app.use(express.static("public"));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("common"));
// app.get("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// route
app.use("/api/users", verifyToken, userRouter);
app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api/messages", verifyToken, messageRouter);
app.use("/api/live", verifyToken, callRouter)
app.use("/api/admin", adminRouter)
app.use(upload)
app.use("/user", router)
app.use("/api/s3Url", async (req, res) => {
  const url = await s3.generateUploadURL();
  res.status(200).json({ url });
});

/** catch 404 and forward to error handler */
app.use("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint doesnt exist",
  });
});

// app.get("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
// db

const MONGO_URL = process.env.MONGO_URL;
mongooes.connect(
  MONGO_URL,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    // if (err) throw err;
    console.log("Connected to MongoDB!!");
  }
);

// server
const server = require("http").createServer(app);
// socket
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  SocketServer(socket, io);
});

ExpressPeerServer(server, { path: "/" });

// server listen
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!!`);
});
