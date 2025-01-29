const { body, param } = require('express-validator');


const userRegisteredValidator = () => {
    // console.log(body)
    return [
        body('email')
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage('Email is invalid'),

        body('username')
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 character long"),
        body('password').trim().notEmpty().withMessage("Password is required")
    ];
}

const userLoginValidator = () => {
    return [
        body('email').notEmpty().withMessage("Eail is required"),
        body('username').optional(),
        body("password").notEmpty().withMessage("Password is required")
    ];
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body('oldPassword').notEmpty().withMessage("Old password is required"),
        body('newPassword').notEmpty().withMessage("New Password is required")
    ];
}

const userForgotPasswordValidator = () => {
    return [
        body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid"),
    ];
}

const userResetForgottenPasswordValidator = () => {
    return [
        body('newPassword').notEmpty().withMessage("Password is required")
    ];
}

module.exports = {
    userRegisteredValidator,
    userLoginValidator,
    userForgotPasswordValidator,
    userResetForgottenPasswordValidator,
    userChangeCurrentPasswordValidator
}