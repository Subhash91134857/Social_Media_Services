const user_services = require('../services/user_services');
const BaseController = require('./BaseController');

class UserController extends BaseController {
    constructor() {
        super();
        this.UserService = user_services
    }
    // registration

    signup() {
        return this.asyncWrapper(async (req) => {
            const { email, password, username } = req.body;
            const { protocol } = req
            const host = req.get('host');
            const payload = {
                email, username, password, protocol, host
            }
            // console.log(payload)
            const result = await this.UserService.signup(payload);
            return {
                data: result,
                message: "Verification Link has been send on given email!"
            }
        })
    }

    verifyEmail() {
        return this.asyncWrapper(async (req) => {
            const { verificationToken } = req.params;
            const { userId } = req.query;
            await this.UserService.verifyEmail(verificationToken, userId);
            return {
                data: {},
                message: 'Email is verified'
            }
        })
    }

    resendEmailVerificationLink() {
        return this.asyncWrapper(async (req) => {
            const { id } = req.params;
            // console.log(id)
            const { protocol } = req;
            const host = req.get('host')
            await this.UserService.resendEmailVerificationLink(id, protocol, host);
            return {
                data: {},
                message: "Verification link send "
            }
        })
    }

    login() {
        return this.asyncWrapper(async (req) => {
            const { username, email, password } = req.body;
            const data = await this.UserService.login(email, username, password);
            return {
                data,
                message: "Login"
            }
        })
    }
}

module.exports = new UserController();