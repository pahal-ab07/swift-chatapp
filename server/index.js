require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connection = require("./db/db.js");
const userRoute = require("./routes/userRoute.js");
const avatarRoute = require("./routes/avatarRoute.js");
const cookieParser = require('cookie-parser')
const createWebSocketServer = require("./wsServer.js");
const path = require("path");

// --- START Route controllers ---
// const registerController = require('./controllers/registerController');
// const loginController = require('./controllers/loginController');
// const verifyEmail = require('./controllers/emailVerifyController');
// const { profileController, profileUpdate } = require("./controllers/profileController");
// const messageController = require("./controllers/messageController");
// const peopleController = require("./controllers/peopleController");
// const { avatarController, getAllAvatars } = require("./controllers/avatarController");
// --- END Route controllers ---


//database connection
connection();
app.use(express.json());
app.use(cookieParser());
// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
    "https://swifty-chatty-appy.onrender.com"
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
    credentials: true, // Allow credentials like cookies
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

app.use("/api/user", userRoute);
app.use("/api/avatar", avatarRoute);

// --- START Inlined Routes for Debugging ---
// const userApiRouter = express.Router();
// userApiRouter.post("/register", registerController);
// userApiRouter.post("/login", loginController);
// userApiRouter.get("/:id/verify/:token", verifyEmail);
// userApiRouter.get("/profile", profileController);
// userApiRouter.get("/messages/:userId", messageController);
// userApiRouter.get("/people", peopleController);
// userApiRouter.put("/profile/update", profileUpdate);
// app.use("/api/user", userApiRouter);

// const avatarApiRouter = express.Router();
// avatarApiRouter.post("/add", avatarController);
// avatarApiRouter.get("/all", getAllAvatars);
// app.use("/api/avatar", avatarApiRouter);
// --- END Inlined Routes for Debugging ---

const port = process.env.PORT || 8000;
const server = app.listen(port, () => console.log(`Application Running on Port ${port}`));

createWebSocketServer(server); 

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
    });
});