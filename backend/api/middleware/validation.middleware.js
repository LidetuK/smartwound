import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Validation Schemas ---

export const registerValidation = [
  body('email').isEmail().withMessage('Must be a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('full_name').notEmpty().withMessage('Full name is required.'),
  handleValidationErrors
];

export const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidationErrors
];

export const woundValidation = [
  body('type').notEmpty().withMessage('Wound type is required.'),
  body('severity').notEmpty().withMessage('Wound severity is required.'),
  body('image_url').optional().isURL().withMessage('Must be a valid URL.'),
  handleValidationErrors
];

export const forumPostValidation = [
  body('content').notEmpty().withMessage('Post content cannot be empty.'),
  handleValidationErrors
];

export const forumCommentValidation = [
  body('content').notEmpty().withMessage('Comment content cannot be empty.'),
  handleValidationErrors
]; 