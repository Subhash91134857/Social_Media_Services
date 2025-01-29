const AppError = require('../utils/app-error')
// Versioning Middleware 
const apiVersioning = (options) => {
    const { strategy, versions } = options;

    if (!Array.isArray(versions) || versions.length === 0) {
        throw new Error('API versioning middleware requires a valid versions array.');
    }

    return (req, res, next) => {
        let isValidVersion = false;

        switch (strategy) {
            case 'urlPath':
                const urlVersion = req.path.split('/')[2]; // Extract `/api/:version/...`
                isValidVersion = versions.includes(urlVersion);
                break;

            case 'header':
                const headerVersion = req.get('Accept-Version');
                isValidVersion = versions.includes(headerVersion);
                break;

            case 'contentType':
                const contentType = req.get('Content-Type');
                if (contentType) {
                    const versionInContentType = contentType.match(/application\/vnd\.api\.(v\d+)\+json/);
                    isValidVersion = versionInContentType && versions.includes(versionInContentType[1]);
                }
                break;

            default:
                throw new Error(`Unsupported versioning strategy: ${strategy}`);
        }

        if (isValidVersion) {
            next();
        } else {
            next(new AppError('API version is not supported', 404, true, 'INVALID_VERSION'));
        }
    };
};

module.exports = { apiVersioning };
