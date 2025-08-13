import User from '../models/User.js';
import { ObjectId } from 'mongodb';

const validateUserInput = (userData) => {
  const { firstName, lastName, email, password, role } = userData;
  
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
    throw new Error('First name must be at least 2 characters long');
  }
  
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
    throw new Error('Last name must be at least 2 characters long');
  }
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Valid email is required');
  }
  
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
};

export const createUser = async (userData) => {
  try {
    validateUserInput(userData);
    
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    const user = new User({
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'user'
    });
    
    const savedUser = await user.save();
    
    return {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt
    };
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

export const getUserByEmail = async (email) => {
  try {
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email is required');
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

export const getUserById = async (id) => {
  try {
    if (!id || !ObjectId.isValid(id)) {
      throw new Error('Valid user ID is required');
    }
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error.message}`);
  }
};

export const validateUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    throw new Error(`Login validation error: ${error.message}`);
  }
};

export const updateUser = async (id, updateData) => {
  try {
    if (!id || !ObjectId.isValid(id)) {
      throw new Error('Valid user ID is required');
    }
    
    const allowedUpdates = ['firstName', 'lastName'];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const user = await User.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};
