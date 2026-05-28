import Joi from 'joi';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = Joi.string().pattern(objectIdRegex).message('Invalid Skill ID format');

const registerSchema = Joi.object({
  title: Joi.string()
    .max(80)
    .trim()
    .required()
    .messages({
      'string.empty': 'Professional headline is required',
      'string.max': 'Professional headline cannot exceed 80 characters'
    }),

  name: Joi.string()
    .min(3)
    .max(64)
    .trim()
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 3 characters',
      'string.max': 'Full name cannot exceed 64 characters'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .required()
    .messages({
      'string.empty': 'Email address is required',
      'string.email': 'Enter a valid email address'
    }),
  
  phone: Joi.string()
    .pattern(/^\+91[6-9]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Enter a valid Indian mobile number starting with +91 (e.g. +919876543210)'
    }),
  
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters'
    })
});

const loginSchema = Joi.object({
  loginKey: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email or phone number is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(64)
    .trim()
    .messages({
      'string.min': 'Full name must be at least 3 characters',
      'string.max': 'Full name cannot exceed 64 characters'
    }),
  
  title: Joi.string()
    .max(80)
    .trim()
    .allow('')
    .messages({
      'string.max': 'Professional headline cannot exceed 80 characters'
    }),
  
  about: Joi.string()
    .max(1000)
    .trim()
    .allow('')
    .messages({
      'string.max': 'About section cannot exceed 1000 characters'
    }),
  
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .messages({
      'any.only': 'Gender must be male, female, or other'
    }),
  
  skills: Joi.array()
    .items(objectIdSchema)
    .unique()
    .messages({
      'array.unique': 'Duplicate skills are not allowed'
    }),
  
  phone: Joi.string()
    .pattern(/^\+91[6-9]\d{9}$/)
    .messages({
      'string.pattern.base': 'Enter a valid Indian mobile number'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .messages({
      'string.email': 'Enter a valid email address'
    }),
  
  password: Joi.string()
    .min(8)
    .messages({
      'string.min': 'Password must be at least 8 characters'
    }),
  
  profileImage: Joi.string().trim().allow(''),
  
  resume: Joi.string()
    .trim()
    .allow('')
    .custom((value, helpers) => {
      if (value && !/^(https?:\/\/.+\.(pdf|doc|docx)|.+\.(pdf|doc|docx))$/i.test(value)) {
        return helpers.error('any.custom');
      }
      return value;
    })
    .messages({
      'any.custom': 'Only PDF, DOC, and DOCX files or document links are supported'
    }),
  
  languages: Joi.array().items(Joi.string().trim()),
  
  experience: Joi.string()
    .valid('fresher', '0-1 years', '1-3 years', '3-5 years', '5-7 years', '7-10 years', '10-15 years', '15+ years')
    .messages({
      'any.only': 'Invalid experience option selected'
    }),
  
  education: Joi.array().items(
    Joi.object({
      _id: Joi.string().pattern(objectIdRegex).allow(''),
      institution: Joi.string().trim().max(100).required().messages({
        'string.empty': 'Institution name is required',
        'string.max': 'Institution name cannot exceed 100 characters'
      }),
      degree: Joi.string().trim().max(100).required().messages({
        'string.empty': 'Degree is required',
        'string.max': 'Degree cannot exceed 100 characters'
      }),
      educationLevel: Joi.string()
        .valid('high-school', 'diploma', 'bachelor', 'master', 'phd', 'certification', 'other')
        .required()
        .messages({
          'any.only': 'Invalid education level selected',
          'any.required': 'Education level is required'
        }),
      startDate: Joi.date().required().messages({
        'any.required': 'Start date is required'
      }),
      endDate: Joi.date().allow(null, ''),
      grade: Joi.string().trim().max(20).allow('').messages({
        'string.max': 'Grade cannot exceed 20 characters'
      })
    })
  ),
  
  certificates: Joi.array().items(
    Joi.object({
      _id: Joi.string().pattern(objectIdRegex).allow(''),
      url: Joi.string().uri({ scheme: ['http', 'https'] }).required().messages({
        'string.uri': 'Invalid certificate URL',
        'any.required': 'Certificate URL is required'
      }),
      issuingAuthority: Joi.string().trim().required().messages({
        'string.empty': 'Issuing authority is required'
      }),
      issuingDate: Joi.date().required().messages({
        'any.required': 'Issuing date is required'
      })
    })
  ),
  
  location: Joi.object({
    country: Joi.string().trim(),
    state: Joi.string().trim(),
    city: Joi.string().trim(),
    address: Joi.string().trim().max(200).allow(''),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).messages({ 'string.pattern.base': 'Enter a valid pincode' })
  })
});

const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    res.status(400);
    return next(new Error(errorMessages));
  }

  req.body = value;
  next();
};

export const validateRegister = validateRequest(registerSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateUpdateProfile = validateRequest(updateProfileSchema);
