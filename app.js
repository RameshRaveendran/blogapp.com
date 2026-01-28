// require environment variables
require("dotenv").config();

// main requires
const express = require ('express');
const session = require('express-session');
const path = require('path');

// local requires
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

// app
const app = express();

// database Connection
connectDB();

// middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

// using app routes
app.use(authRoutes);

// session
app.use(
    session({
        secret:process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

// viewengine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



// routes
app.get("/",(req , res) => {
    res.send('Blog app Running');
});

// vercel exportation
module.exports = app;

//local server runner
if(require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
}