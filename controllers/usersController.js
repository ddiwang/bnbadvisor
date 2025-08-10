import User from '../models/Users.js';

// 显示注册表单
export const showSignupForm = (req, res) => {
  res.render('users/signup', { title: 'Create an Account' });
};

// 处理注册请求
export const signup = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  
  // 验证密码匹配
  if (password !== confirmPassword) {
    return res.render('users/signup', {
      title: 'Create an Account',
      error: 'Passwords do not match',
      formData: { firstName, lastName, email }
    });
  }
  
  try {
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('users/signup', {
        title: 'Create an Account',
        error: 'Email is already registered',
        formData: { firstName, lastName, email }
      });
    }
    
    // 创建新用户
    const newUser = new User({
      firstName,
      lastName,
      email,
      hashedPassword: password // 中间件会自动哈希
    });
    
    await newUser.save();
    
    // 自动登录
    req.session.user = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture
    };
    
    res.redirect('/profile');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).render('users/signup', {
      title: 'Create an Account',
      error: 'An error occurred during registration',
      formData: { firstName, lastName, email }
    });
  }
};

// 显示登录表单
export const showLoginForm = (req, res) => {
  res.render('users/login', { title: 'Login to Your Account' });
};

// 处理登录请求
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('users/login', {
        title: 'Login to Your Account',
        error: 'Invalid email or password',
        formData: { email }
      });
    }
    
    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('users/login', {
        title: 'Login to Your Account',
        error: 'Invalid email or password',
        formData: { email }
      });
    }
    
    // 设置session
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    };
    
    res.redirect('/profile');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('users/login', {
      title: 'Login to Your Account',
      error: 'An error occurred during login',
      formData: { email }
    });
  }
};

// 用户退出
export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Could not log out');
    }
    res.redirect('/');
  });
};

// 显示用户资料
export const showProfile = (req, res) => {
  const { user } = req.session;
  res.render('users/profile', {
    title: 'Your Profile',
    user
  });
};

// 更新用户资料
export const updateProfile = async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;
  const userId = req.session.user._id;
  
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phoneNumber },
      { new: true, runValidators: true }
    );
    
    // 更新session中的用户信息
    req.session.user = {
      ...req.session.user,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber
    };
    
    req.flash('success', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    req.flash('error', 'Failed to update profile');
    res.redirect('/profile');
  }
};

// 更改密码
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.user._id;
  
  // 验证新密码匹配
  if (newPassword !== confirmPassword) {
    req.flash('error', 'New passwords do not match');
    return res.redirect('/profile');
  }
  
  try {
    const user = await User.findById(userId);
    
    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/profile');
    }
    
    // 更新密码
    user.hashedPassword = newPassword; // 中间件会自动哈希
    await user.save();
    
    req.flash('success', 'Password changed successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Password change error:', error);
    req.flash('error', 'Failed to change password');
    res.redirect('/profile');
  }
};