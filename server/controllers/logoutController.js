const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .clearCookie("authToken", {
        httpOnly: false,
        sameSite: "none",
        secure: true,
      })
      .send({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logoutController:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = logoutController; 