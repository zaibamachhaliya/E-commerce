const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/db");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TOKEN GENERATORS
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET || "secretkey",
        {
            expiresIn: "15m"
        }
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString("hex");
};

// =============================
// TOKEN GENERATORS
// =============================
const crypto = require("crypto");

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "15m" } // short-lived access token
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString("hex"); // random refresh token
};

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }

    const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message:
                "Password must contain uppercase, lowercase, number and special character"
        });
    }

    // CHECK EXISTING USER
    db.query("SELECT * FROM users WHERE email = ?", [email], async (error, result) => {
      if (error) return res.status(500).json({ success: false, message: error.message });
      if (result.length > 0) return res.status(400).json({ success: false, message: "User already exists" });

      // HASH PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10);

      // INSERT USER
      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, "user"], // default role as "user"
        (error, result) => {
          if (error) return res.status(500).json({ success: false, message: error.message });
          res.status(201).json({ success: true, message: "User registered successfully" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], async (error, result) => {
      if (error) return res.status(500).json({ success: false, message: error.message });
      if (result.length === 0) return res.status(400).json({ success: false, message: "Invalid credentials" });

      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

      // GENERATE TOKENS
      const accessToken =
          generateAccessToken(user);

      const refreshToken =
          generateRefreshToken();

      // Save refresh token in DB
      db.query(
          "UPDATE users SET refresh_token = ? WHERE id = ?",
          [refreshToken, user.id],
          (err) => {
              if (err) console.error("Failed to save refresh token:", err);
          }
      );
      res.status(200).json({
          success: true,
          message: "Login successful",
      
          accessToken,
          refreshToken,
      
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
          }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REFRESH ACCESS TOKEN
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } =
            req.body;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        // Validate refresh token from DB
        db.query(
            "SELECT * FROM users WHERE refresh_token = ?",
            [refreshToken],
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                if (!result.length) return res.status(401).json({ success: false, message: "Invalid refresh token" });

                const user = result[0];
                const newAccessToken = generateAccessToken(user);

                res.status(200).json({
                    success: true,
                    accessToken: newAccessToken
                });
            }
        );
        return; // Prevent executing rest of try block
        return; // Prevent executing rest of try block
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    signup,
    login,
    refreshAccessToken
};