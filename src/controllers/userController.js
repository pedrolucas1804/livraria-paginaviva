const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/users/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/users/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    res.json({
      message: 'Login realizado com sucesso.',
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário atualizado.', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/users/:id/password
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    user.password = req.body.password;
    await user.save();
    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, getUsers, updateUser, updatePassword, deleteUser };
