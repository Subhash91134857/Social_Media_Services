const AppError = require('../utils/App-Error');
const Response = require('../utils/Response-Handler');

module.exports = (fn) => async (req, res, next) => {
    try {

        const {
            data,
            statusCode = 200,
            message = 'API executed successfully',
        } = await fn(req, res, next) || {};

        // console.log(data);
        if (!res.headersSent) {
            if (!data) {
                throw new AppError(statusCode, "API execution failed", true, "API_ERROR");
            }

            Response.sendSuccess(res, data, statusCode, message);
        }

    } catch (err) {
        if (err instanceof AppError) {
            AppError.handle(err, req, res, next);
        } else {
            if (!res.headersSent) {
                next(err);
            }
        }
    }
}