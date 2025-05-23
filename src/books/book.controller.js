const Book = require('./book.model');

const postABook = async (req, res) => {
  try {
    const newBook = new Book({ ...req.body });
    await newBook.save();
    res.status(201).json({ message: "Book posted successfully", book: newBook });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ message: "Failed to create book" });
  }
};

const getBooks = async (req, res) => {
  const { genre, author, minPrice, maxPrice, page = 1, limit = 10, sort, search } = req.query;
  const filter = {};

  if (genre) filter.genres = { $in: [genre] };
  if (author) filter.authors = author;
  if (minPrice || maxPrice) {
    filter.original_price = {};
    if (minPrice) filter.original_price.$gte = Number(minPrice);
    if (maxPrice) filter.original_price.$lte = Number(maxPrice);
  }
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { genres: regex },
      { 'authors.name': regex },
    ];
  }

  try {
    const skip = (Number(page) - 1) * Number(limit);
    let query = Book.find(filter)
      .select("title authors description genres stock original_price image_url discounts")
      .skip(skip)
      .limit(Number(limit));

    if (sort) {
      const sortOptions = {};
      sortOptions[sort.startsWith('-') ? sort.slice(1) : sort] = sort.startsWith('-') ? -1 : 1;
      query = query.sort(sortOptions);
    }

    const [books, total] = await Promise.all([
      query.exec(),
      Book.countDocuments(filter)
    ]);

    res.status(200).json({
      books,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};


const getABookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

module.exports = {
  postABook,
  getBooks,
  getABookById
};
