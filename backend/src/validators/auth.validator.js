const { body } = require('express-validator');

// Note: Field names 'ten_hien_thi' (display name) and 'mat_khau' (password)
// are used to match the variable names in backend/src/controllers/auth.controller.js.
// 'identifier' is used in login as per the controller's logic.

const registerValidation = [
    body('ten_hien_thi')
        .trim()
        .notEmpty().withMessage('Display name is required')
        .isLength({ min: 2 }).withMessage('Display name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('mat_khau')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Identifier (email or username) is required'),
    body('mat_khau')
        .notEmpty().withMessage('Password is required')
];

module.exports = {
    registerValidation,
    loginValidation
};
