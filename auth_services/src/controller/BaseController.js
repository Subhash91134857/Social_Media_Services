const asyncWrapper = require('../utils/Async-Wrapper');

class BaseController {
    constructor() {
        this.asyncWrapper = asyncWrapper;
    }
}
module.exports = BaseController;