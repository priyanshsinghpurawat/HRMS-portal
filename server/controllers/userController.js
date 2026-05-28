import User from '../models/userModel.js';
import { generateTokens } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import { deleteFromCloudinary } from '../middlewares/uploadMiddleware.js';

export const registerUser = async (req, res, next) => {
  try {
    const { title , name , email , phone, password } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      return next(new Error('User already exists with this email address'));
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      res.status(400);
      return next(new Error('User already exists with this phone number'));
    }

    const user = await User.create({
     title,
     name,
     email,
     phone,
     password
    });

    if (user) {
      generateTokens(res, user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          title: user.title,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isVerified: user.isVerified,
          isProfileCompleted: user.isProfileCompleted
        }
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data provided'));
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { loginKey, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: loginKey.toLowerCase() }, { phone: loginKey }]
    }).select('+password');

    if (!user) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    generateTokens(res, user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isProfileCompleted: user.isProfileCompleted,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isProduction,
      sameSite: 'strict',
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: isProduction,
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401);
      return next(new Error('Not authorized, no refresh token provided'));
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret_job_portal_2026_xYz';
    const decoded = jwt.verify(refreshToken, refreshSecret);

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      return next(new Error('Not authorized, user does not exist'));
    }

    const accessSecret = process.env.ACCESS_TOKEN_SECRET || 'access_token_secret_job_portal_2026_abC';
    const newAccessToken = jwt.sign({ id: user._id }, accessSecret, {
      expiresIn: '15m',
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully'
    });
  } catch (error) {
    console.error(`Token Refresh Error: ${error.message}`);
    res.status(401);
    next(new Error('Not authorized, refresh token validation failed'));
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        success: true,
        data: user
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

const evaluateProfileCompletion = (user) => {
  const hasBasicInfo = !!(user.name && user.email && user.phone);
  const hasLocation = !!(user.location && user.location.country && user.location.state && user.location.city);
  const hasDetails = !!(user.title && user.about && user.experience);
  const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
  
  return hasBasicInfo && hasLocation && hasDetails && hasSkills;
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (req.body.profileImage === '' && user.profileImage && user.profileImage !== 'placeholder') {
      await deleteFromCloudinary(user.profileImage, 'image');
    }
    if (req.body.resume === '' && user.resume) {
      await deleteFromCloudinary(user.resume, 'raw');
    }

    const fieldsToUpdate = [
      'name',
      'title',
      'about',
      'gender',
      'skills',
      'phone',
      'email',
      'profileImage',
      'resume',
      'languages',
      'experience',
      'education',
      'certificates',
      'location'
    ];

    if (req.body.email && req.body.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists) {
        res.status(400);
        return next(new Error('Email is already in use by another account'));
      }
    }

    if (req.body.phone && req.body.phone !== user.phone) {
      const phoneExists = await User.findOne({ phone: req.body.phone });
      if (phoneExists) {
        res.status(400);
        return next(new Error('Phone number is already in use by another account'));
      }
    }

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'location' && typeof req.body.location === 'object') {
          user.location = {
            ...user.location,
            ...req.body.location
          };
        } else {
          user[field] = req.body[field];
        }
      }
    });

    if (req.body.password) {
      user.password = req.body.password;
    }

    user.isProfileCompleted = evaluateProfileCompletion(user);

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400);
      return next(new Error('Invalid User ID format'));
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

