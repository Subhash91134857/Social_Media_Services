// for handling all the error from validator chains
const { validationResult } = require("express-validator");
const AppError = require("../utils/App-Error");

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

    throw new AppError(422, "Recieved data is not valid", extractedErrors);
}

module.exports = { validate }