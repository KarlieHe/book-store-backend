const mongoose = require('mongoose')
const Order = require("./order.model");
const Book = require("../books/book.model");
// POST /api/orders
const postAnOrder = async (req, res) => {

  const { items, ...orderData } = req.body
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //1. create a new order and save it
    const newOrder = new Order({ 
      ...orderData,
      items,
    });
    await newOrder.save({ session });

    // 2. update the stock of each book in the order
    for (const item of items) {
      const book = await Book.findById(item._id).session(session)

      if (!book) {
        throw new Error(`Product not found: ${item._id}`)
      }

      if (book.stock < item.cartQuantity) {
        throw new Error(`Insufficient stock for product: ${book.title}`)
      }

      book.stock -= item.cartQuantity
      await book.save({ session })
    }

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });


  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const getOrdersByUserId = async (req, res) => {

  try {
    const orders = await Order.find({ user: req.user.userId }).select("orderNum shippingInfo totalAmount createdAt orderStatus").sort({ createdAt: -1 });

    // if (!orders || orders.length === 0) {
    //   return res.status(404).json({ message: "No orders found for this user" });
    // }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("order!!!", order);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};


module.exports = {
  postAnOrder,
  getOrdersByUserId,
  getOrderById,
};