const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  bulkUpdateUserStatus,
} = require("../controllers/admin.controller");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.post("/users/bulk-status", bulkUpdateUserStatus);

module.exports = router;