const express = require('express')
const app = express()
const session = require("express-session");
const cors = require('cors')

const mongoose = require('mongoose')
const port = process.env.PORT || 8000

require('dotenv').config()

const allowedOrigins = [
  "https://book-store-pied-psi.vercel.app",
  "http://localhost:5173" // if testing locally
];

//middleware
app.use(express.json())
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}))

//session
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1天
  }
}));

//routes
const bookRoutes = require('./src/books/book.route')
app.use("/api/books", bookRoutes)

const userRoutes = require('./src/users/user.route')
app.use("/api/users", userRoutes);

const orderRoutes = require('./src/orders/order.route')
app.use("/api/orders", orderRoutes);

// Stripe payment configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
});

app.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
})

app.post('/v1/payment_intents', async (req, res) => {
  try {
      const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount, //req.body.amount,
      currency: req.body.currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret, paymentIntent: paymentIntent,
    });
  } catch (error) {
    return res.status(400).send({ 
      error: {
        message: error.message,
      } 
    });
  }
})

async function main() {
  await mongoose.connect(process.env.DB_URI)

  app.get('/', (req, res) => {
    res.send('Book store server is running.')
  })

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

main().then(() => console.log("Mongodb connect successfully!")).catch(err => console.log(err));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
