const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getUsers,
  updateUser,
  updatePassword,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/', protect, adminOnly, getUsers);
router.put('/:id', protect, updateUser);
router.patch('/:id/password', protect, updatePassword);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
