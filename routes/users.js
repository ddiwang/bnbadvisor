
import { Router } from 'express';
import User from '../models/User.js';
import { sanitizeInput } from '../middleware/xss.js';

const router = Router();

// API endpoint to check if email exists
router.get('/api/check-email/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const existingUser = await User.findOne({ email });
    
    res.json({
      exists: !!existingUser,
      message: existingUser ? 'This email is already registered' : 'Email is available'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error checking email',
      exists: false
    });
  }
});

router.get('/api/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Invalid user ID' });
  }
});

router.get('/api', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role; 
    
    const query = role ? { role } : {};
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

router.patch('/api/:id/metadata', sanitizeInput, async (req, res) => {
  try {
    if (!req.session.user || req.session.user._id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { metadata } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { metadata } },
      { new: true, select: '-password' }
    );
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user metadata' });
  }
});

//login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/users/profile');
  }
  res.render('users/login', { title: 'Login - BNB Advisor' });
});

// user login
router.post('/login', sanitizeInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).render('users/login', {
        title: 'Login - BNB Advisor',
        error: 'Email and password are required',
        email
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).render('users/login', {
        title: 'Login - BNB Advisor',
        error: 'Invalid email or password',
        email: req.body.email
      });
    }
    
    // Check password using User model method
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).render('users/login', {
        title: 'Login - BNB Advisor',
        error: 'Invalid email or password',
        email: req.body.email
      });
    }
    
    // Set session
    req.session.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };
    
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).render('users/login', {
      title: 'Login - BNB Advisor',
      error: error.message,
      email: req.body.email
    });
  }
});

//signup page
router.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/users/profile');
  }
  res.render('users/signup', { title: 'Sign Up - BNB Advisor' });
});

//registration
router.post('/signup', sanitizeInput, async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      return res.status(400).render('users/signup', {
        title: 'Sign Up - BNB Advisor',
        error: 'All fields are required',
        formData: { firstName, lastName, email, role }
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).render('users/signup', {
        title: 'Sign Up - BNB Advisor',
        error: 'Passwords do not match',
        formData: { firstName, lastName, email, role }
      });
    }
    
    // Enhanced validation
    if (firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }
    
    if (lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role
    };
    
    // Create new user 
    const newUser = new User(userData);
    await newUser.save();
    
    req.session.user = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role
    };
    
    res.redirect('/users/profile');
  } catch (error) {
    console.error('Signup error:', error);
    let errorMessage = error.message;
    
    // duplicate key error for email
    if (error.code === 11000 && error.keyPattern?.email) {
      errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
    }
    
    res.status(400).render('users/signup', {
      title: 'Sign Up - BNB Advisor',
      error: errorMessage,
      formData: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role
      }
    });
  }
});

//user profile page
router.get('/profile', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/users/login');
  }
  
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'User profile not found',
        isNotFound: true
      });
    }
    
    res.render('users/profile', { 
      title: 'My Profile - BNB Advisor',
      user,
      isOwner: true
    });
  } catch (error) {
    console.error('Profile load error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load profile',
      isNotFound: false
    });
  }
});


router.post('/profile', sanitizeInput, async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/users/login');
  }
  
  try {
    const { firstName, lastName } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      { firstName, lastName },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    // Update user info in session
    req.session.user.firstName = updatedUser.firstName;
    req.session.user.lastName = updatedUser.lastName;
    
    res.render('users/profile', {
      title: 'My Profile - BNB Advisor',
      user: updatedUser,
      isOwner: true,
      success: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    try {
      const user = await User.findById(req.session.user._id);
      res.status(400).render('users/profile', {
        title: 'My Profile - BNB Advisor',
        user,
        isOwner: true,
        error: error.message
      });
    } catch (fetchError) {
      console.error('Error fetching user for error display:', fetchError);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to update profile',
        isNotFound: false
      });
    }
  }
});

// logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', {
        title: 'Error',
        message: 'Could not log out',
        isNotFound: false
      });
    }
    res.redirect('/');
  });
});


router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('error', {
        title: 'User Not Found',
        message: 'The user you are looking for does not exist',
        isNotFound: true
      });
    }
    
    const isOwner = req.session.user && req.session.user._id.toString() === req.params.id;
    
    res.render('users/profile', {
      title: `${user.firstName} ${user.lastName} - BNB Advisor`,
      user,
      isOwner
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(404).render('error', {
      title: 'User Not Found',
      message: 'The user you are looking for does not exist',
      isNotFound: true
    });
  }
});

export default router;
