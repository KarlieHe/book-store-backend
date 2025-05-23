const mongoose = require('mongoose')
const { getNextOrderNumber } = require('../utils/Counter')



const orderSchema = new mongoose.Schema({
  orderNum: { type: String, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      title: String,
      finalPrice: Number,
      cartQuantity: Number,
      image_url: String,
    }
  ],
  shippingInfo: {
    firstName: String,
    surname: String,
    email: String,
    phone: String,
    address: {
      country: String,
      state: String,
      street: String,
      suburb: String,
      postCode: String,
    },
    deliveryMethod: { type: String, enum: ["Delivery", "Pickup"], required: true },
  },
  billingInfo: {
    firstName: String,
    surname: String,
    email: String,
    phone: String,
    address: {
      country: String,
      state: String,
      street: String,
      suburb: String,
      postCode: String,
    },
  },
  paymentResult: {
    id: String,
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
  },
  orderStatus: {
    type: String,
    enum: ["Processing", "Collected", "Delivered", "Cancelled"],
    default: "Processing",
  },
  totalAmount: {
    type: Number,
    required: true,
}}, {
  timestamps: true,
});

orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNum) {
    this.orderNum = await getNextOrderNumber();
  }
  next();
}); 

const Order = mongoose.model('Order', orderSchema)

module.exports = Order