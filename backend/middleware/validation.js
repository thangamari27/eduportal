const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('phone_no').isLength({ min: 10, max: 15 }),
  body('password').isLength({ min: 6 }),
  handleValidationErrors
];

// Personal info validation
const validatePersonalInfo = [
  body('email').isEmail().normalizeEmail(),
  body('phone_number').isLength({ min: 10, max: 15 }),
  body('aadhaar_number').isLength({ min: 12, max: 12 }),
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validatePersonalInfo,
  handleValidationErrors
};