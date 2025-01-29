const UserRouter = require('./users/user_routes');

const routes = (app) => {
    app.use('/api/v1/auth', UserRouter);
}
module.exports = { routes }