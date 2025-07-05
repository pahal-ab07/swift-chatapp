const bcrypt = require("bcrypt");
const { User, validateLogin } = require("../models/userModel.js");

const loginController = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);

    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).send({ message: "Invalid Email" });
    }

    // Check password validity using bcrypt
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).send({ message: "Invalid Password" });
    }

    // Check if the user's email is verified
    if (!user.verified) {
      return res.status(400).send({ message: "Email Not Verified" });
    }

    // Generate authentication token and send successful login response
    const token = user.generateAuthToken();
    console.log("Setting cookie with token:", token.substring(0, 20) + "...");
    console.log("Cookie options:", {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    res
      .status(200)
      .cookie("authToken", token, {
        httpOnly: false,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .send({ 
        message: "Login successful", 
        status: 200,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    return;
  } catch (error) {
    console.error("Error in loginController:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = loginController;