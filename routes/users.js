import express from 'express';
import {
  showSignupForm,
  signup,
  showLoginForm,
  login,
  logout,
  showProfile,
  updateProfile,
  changePassword
} from '../controllers/userController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// 注册路由
router.get('/signup', showSignupForm);
router.post('/signup', signup);

// 登录路由
router.get('/login', showLoginForm);
router.post('/login', login);

// 退出路由
router.get('/logout', logout);

// 用户资料路由（需要认证）
router.get('/profile', isAuthenticated, showProfile);
router.post('/profile', isAuthenticated, updateProfile);
router.post('/profile/password', isAuthenticated, changePassword);

export default router;