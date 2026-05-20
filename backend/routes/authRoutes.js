const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    refreshAccessToken
} = require("../controllers/authController");

// =============================
// AUTH ROUTES
// =============================
router.post("/signup", signup);
router.post("/login", login);

// =============================
// REFRESH TOKEN ROUTE
// =============================
router.post("/refresh-token", refreshAccessToken);

// =============================
// AUTH STATUS ROUTE
// =============================
router.get("/status", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Auth API running"
    });
});

module.exports = router;