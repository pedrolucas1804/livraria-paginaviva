const Book = require('../models/Book');

// GET /api/books?search=...
const getBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title:    { $regex: search, $options: 'i' } },
          { author:   { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ]
      };
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ message: 'Livro cadastrado com sucesso.', book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });
    res.json({ message: 'Livro atualizado com sucesso.', book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });
    res.json({ message: 'Livro removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
