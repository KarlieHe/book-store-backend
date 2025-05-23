const express = require('express')
const { postABook, getBooks, getABookById } = require('./book.controller')
const router = express.Router()

// frontend => backend server => controller => book schema => database 
// => send to server => back to the frontend
// post = when submit sth. fronted to db
// get = when get sth. back from db
// put/patch = when edit or update sth.
// delete = when delete sth.


// post a book
router.post("/create-book", postABook) 

//get all books
router.get("/", getBooks)

//single book endpoint
router.get("/:id", getABookById)



module.exports = router