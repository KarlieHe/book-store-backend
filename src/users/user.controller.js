const User = require("./user.model");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { firstName, surname, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const newUser = new User({ firstName, surname, email, password, role: "user" }); // Always "user"
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error user registration", error)
        res.status(500).send({message: "Failed to create user"})
    }
};

const registerAdmin = async (req, res) => {
  try {
    const { firstName, surname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Admin email already registered" });

    const newAdmin = new User({ firstName, surname, email, password, role: "admin" }); // Admin role
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error admin registration", error)
        res.status(500).send({message: "Failed to create admin"})
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT Token including role
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "10m" }
    );

    res.status(200).json({ 
      message: "Login successful", 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        surname: user.surname,
        email: user.email,
        role: user.role
      } 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const logoutUser = (req, res) => {
  // const token = req.headers.authorization?.split(' ')[1]; // Extract token
  // if (!token) return res.status(400).json({ message: 'No token provided' });

  // blacklist.add(token); // Add token to blacklist
  res.json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    // console.log("user", user);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, surname } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, surname },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    // console.log("updatedUser", updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
    registerUser,
    registerAdmin,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    changePassword
  
}