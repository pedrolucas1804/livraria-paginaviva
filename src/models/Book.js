const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Autor é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: [0, 'Preço não pode ser negativo'],
    },
    category: {
      type: String,
      required: [true, 'Categoria é obrigatória'],
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Estoque não pode ser negativo'],
    },
    isbn: {
      type: String,
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
    pages: {
      type: Number,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Índice de texto para busca por título, autor e categoria
bookSchema.index({ title: 'text', author: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
