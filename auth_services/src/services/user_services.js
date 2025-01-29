const UserModel = require('../models/User');
const AppError = require('../utils/App-Error');
const crypto = require("crypto");
const { sendMail, emailVerificationMailgenContent } = require('../utils/mail');
const mongoose = require('mongoose');
const argon2 = require('argon2')


class UserService {
    constructor() {
        this.model = UserModel;
    }

    // generating accessToken and refreshToken

    async generateAccessAndRefreshToken(userId) {
        try {
            const user = await this.model.findById(userId);

            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            // attach refresh token to the user document
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            return {
                accessToken, refreshToken
            }
        } catch (error) {
            throw new AppError(500, "Something went wrong while gerating the access token")
        }
    }

    async signup(payload) {
        const { email, username, password, protocol, host } = payload;

        // Check if user already exists
        const existedUser = await this.model.findOne({
            $or: [{ username }, { email }],
        });
        if (existedUser) {
            throw new AppError(409, "User with email or username already exists", []);
        }

        // Create new user
        const user = await this.model.create({
            email,
            username,
            password,
            isEmailVerified: false,
        });

        // Generate temporary token
        const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = tokenExpiry;

        await user.save();

        // Generate verification link

        const verificationLink = `${protocol}://${host}/api/v1/user/verify-email/${unHashedToken}?userid=${user.id}`;

        // Send verification email
        try {
            await sendMail({
                email: user.email,
                subject: "Please verify your email",
                mailgenContent: emailVerificationMailgenContent(user.username, verificationLink),
            });
        } catch (error) {
            logger.error("Failed to send verification email", { error });
            await this.model.findByIdAndDelete(user._id); // Rollback
            throw new AppError(500, "Email sending failed, user creation rolled back");
        }

        // Exclude sensitive fields in the response
        const { password: _, refreshToken, emailVerificationToken, emailVerificationExpiry, ...createdUser } = user.toObject();

        return { createdUser };
    }

    async verifyEmail(verificationToken, userId) {
        if (!verificationToken || !userId) {
            throw new AppError(400, 'Email verification token or userId is missing');
        }

        // Fetch the user from the database
        const user = await this.model.findById(userId);
        if (!user) {
            throw new AppError(400, "User not found");
        }
        // Check if the token has expired
        if (Date.now() > new Date(user.emailVerificationExpiry).getTime()) {
            throw new AppError(400, "Token has expired");
        }

        // Verify the token
        try {
            const isValid = await argon2.verify(user.emailVerificationToken, verificationToken);
            if (!isValid) {
                throw new AppError(400, "Invalid token");
            } else {
                // Clear the token and mark the email as verified
                user.emailVerificationExpiry = null;
                user.emailVerificationToken = null;
                user.isEmailVerified = true;
            }
        } catch (error) {
            throw new AppError(500, "Error while verifying the token");
        }
        // Save the user without validation
        await user.save();


        return {
            user,
        };
    }

    async resendEmailVerificationLink(userId, protocol, host) {
        if (!userId) {
            throw new AppError(400, "UserID not found");
        }
        const user = await this.model.findById(userId);

        if (!user) {
            throw new AppError(404, "User does not exists");
        }
        if (user.isEmailVerified) {
            throw new AppError(409, "Email is already verified!");
        }
        const { unHashedToken, hashedToken, tokenExpiry } = await user.generateTemporaryToken();
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = tokenExpiry;
        await user.save({ validateBeforeSave: false })
        // sending the email verification 
        const verificationLink = `${protocol}://${host}/api/v1/user/verify-email/${unHashedToken}?userId=${user.id}`;
        try {
            await sendMail({
                email: user.email,
                subject: "Please verify your email",
                mailgenContent: emailVerificationMailgenContent(user.username, verificationLink),
            });
        } catch (error) {
            logger.error("Failed to send verification email", { error });
            await this.model.findByIdAndDelete(user._id); // Rollback
            throw new AppError(500, "Email sending failed, user creation rolled back");
        }
        return {
            user
        }
    }

    async login(email, username, password) {
        if (!username && !password) {
            throw new AppError(400, "Username or password is required");
        }
        const user = await this.model.findOne({
            $or: [{ username }, { email }]
        })
        if (!user) {
            throw new AppError(404, 'User does not exist');
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid user credentials');
        }

        const { accessToken, refreshToken } = await this.generateAccessAndRefreshToken(user._id);
        const loggedUser = await this.model.findById(user._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        )

        return {
            accessToken,
            refreshToken,
            loggedUser
        }

    }



}

module.exports = new UserService();