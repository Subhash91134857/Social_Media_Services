const express = require('express');
const router = express.Router();
const { userRegisteredValidator, userLoginValidator } = require("../../validator/auth/user_validator")
const UserController = require('../../controller/UserController');
const { validate } = require('../../validator/validate');



// routes related to users
router.post('/register', userRegisteredValidator(), validate, UserController.signup());
router.get('/verify-email/:verificationToken', UserController.verifyEmail());
router.get('/resend-verificationlink/:id', UserController.resendEmailVerificationLink());
router.get('/login', userLoginValidator(), validate, UserController.login());


module.exports = router;