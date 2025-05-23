const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Author's name
  bio: { type: String }                  // Author's bio
});

const discountSchema = new mongoose.Schema({                  
  discount_type: { type: String, enum: ['percentage', 'fixed'], required: true }, 
  discount_value: { type: Number, required: true },                   
  valid_from: { type: Date, required: true },                           
  valid_to: { type: Date, required: true },                             
  description: { type: String },                                        
});

const bookSchema = new mongoose.Schema({
    title: { type: String, require: true },
    authors: [authorSchema], 
    description: { type: String, require: true },
    genres: { type: [String], require: true },
    stock: { type: Number, require: true },
    trending: { type: Boolean, require: true },
    image_url: { type: String, require: true },
    original_price: { type: Number, require: true },
    discounts: [discountSchema]
}, {
    timestamps: true,
}) 

const Book = mongoose.model('Book', bookSchema)

module.exports = Book