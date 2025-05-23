const express = require('express')
const { registerUser, registerAdmin, loginUser, logoutUser, getProfile, updateProfile, changePassword } = require('./user.controller')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.post("/register", registerUser)
router.post("/registerAdmin", registerAdmin)
router.post("/login", loginUser)
router.post("/logout", logoutUser)
router.get("/me", authMiddleware, getProfile)
router.put("/me", authMiddleware, updateProfile)
router.put("/me/password", authMiddleware, changePassword)

module.exports = router