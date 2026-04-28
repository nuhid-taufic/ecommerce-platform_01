const User = require("../models/User");
const ResetOtp = require("../models/ResetOtp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailValidator = require("deep-email-validator");
const nodemailer = require("nodemailer");

const register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format!" });
    }

    // Deep Email Validation (Checks MX records, domain existence, typo etc)
    const { valid, reason, validators } = await emailValidator.validate(email);
    if (!valid) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This email address does not appear to be real or cannot receive emails.",
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({
          success: false,
          message: "Email already exists! Please login.",
        });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, mobile, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Registration successful! You can now login.",
      });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  console.log("👉 Login function triggered!");
  console.log("👉 Body Data:", req.body);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });

    if (!user.password) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "You signed up with Google. Please use 'Sign in with Google'.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials!" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "enterprise_super_secret_key",
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email." });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing Reset OTPs for this email
    await ResetOtp.deleteMany({ email });

    const newResetOtp = new ResetOtp({ email, otp: otpCode });
    await newResetOtp.save();

    // Send Email using Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: `"STUDIO. Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Code - STUDIO.",
        html: `<div style="font-family:sans-serif; text-align:center; padding:20px;">
                        <h2>Password Reset Request</h2>
                        <p>Your verification code to reset your password is:</p>
                        <h1 style="letter-spacing: 5px; font-size: 32px; background:#f4f4f4; padding:10px; border-radius:10px; display:inline-block;">${otpCode}</h1>
                        <p>This code will expire in 10 minutes.</p>
                       </div>`,
      });
    } else {
      console.log(
        `\n\n[DEV MODE] RESET PASSWORD OTP FOR ${email} IS: ${otpCode}\n\n`,
      );
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Password reset code sent to your email!",
      });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send reset code." });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const validOtp = await ResetOtp.findOne({ email, otp });
    if (!validOtp) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification code.",
        });
    }

    res
      .status(200)
      .json({ success: true, message: "OTP Verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Final security check
    const validOtp = await ResetOtp.findOne({ email, otp });
    if (!validOtp) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification code.",
        });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters long.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ email }, { password: hashedPassword });

    // Clean up OTP so it can't be reused
    await ResetOtp.deleteMany({ email });

    res
      .status(200)
      .json({
        success: true,
        message: "Password reset successfully! You can now log in.",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Password reset failed." });
  }
};

const saveAddress = async (req, res) => {
  try {
    const { email, address, index } = req.body;
    if (!email || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Email and address are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.addresses = user.addresses || [];
    
    if (index !== undefined && index >= 0 && index < user.addresses.length) {
      user.addresses[index] = address;
    } else {
      user.addresses.push(address);
    }
    
    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: index !== undefined ? "Address updated successfully" : "Address saved successfully",
        addresses: user.addresses,
      });
  } catch (error) {
    console.error("Save Address Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { email, index } = req.body;
    if (!email || index === undefined) {
      return res.status(400).json({ success: false, message: "Email and index are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.addresses.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, name, mobile, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    
    if (newPassword) {
      const { currentPassword } = req.body;
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required to set a new one" });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Incorrect current password" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  saveAddress,
  deleteAddress,
  updateProfile,
  deleteAccount,
};
