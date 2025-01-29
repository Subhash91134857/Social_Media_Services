const mongoose = require("mongoose");
const argon2 = require("argon2");
const AppError = require("../utils/App-Error")
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { config } = require('../utils/Env-Utils');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }

}, { timestamps: true })


userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            // if there's a risk of calling save multiple times unintentionally, ensuring this to avoid the problem
            if (!this.password.startsWith('$argon2')) {
                this.password = await argon2.hash(this.password, {
                    type: argon2.argon2id
                })
            }
        }
        next();
    } catch (error) {
        next(error);
    }
})
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);

    } catch (error) {
        throw new AppError('Password verification failed', 500, error);
    }
}
userSchema.methods.generateAccessToken = function () {
    const secret = config.tokens.accessToken.secret;
    const payload = { id: this._id, email: this.email, username: this.username };
    const expiry = parseInt(config.tokens.accessToken.expiry);

    return jwt.sign(payload, secret, { expiresIn: expiry });
}
userSchema.methods.generateRefreshToken = function () {
    const secret = config.tokens.refreshToken.secret;
    const payload = { id: this._id };
    const expiry = parseInt(config.tokens.refreshToken.expiry);
    return jwt.sign(payload, secret, { expiresIn: expiry });
}
userSchema.methods.generateTemporaryToken = async function () {
    const unHashedToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = await argon2.hash(unHashedToken, {
        type: argon2.argon2id,
    });
    const expiryDuration = parseInt(config.tokens.temporaryToken.expiry, 10);
    const tokenExpiry = Date.now() + expiryDuration * 60 * 1000;
    return { unHashedToken, hashedToken, tokenExpiry };

}

userSchema.index({ username: 'text' });


const UserModal = mongoose.model('User', userSchema);

module.exports = UserModal;