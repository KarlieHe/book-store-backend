const express = require('express')
const { postAnOrder, getOrdersByUserId, getOrderById } = require('./order.controller')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

router.post("/submit-order", postAnOrder) 
router.get("/get-orders-by-user-id", authMiddleware, getOrdersByUserId) 
router.get("/:id", authMiddleware, getOrderById) 

module.exports = router