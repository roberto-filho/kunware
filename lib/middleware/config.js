const express = require('express');
const bodyParser = require('body-parser');

const config = {};
const configList = [
    {
        'name': 'status',
        'type': 'number',
        'validator': (x) => Number.isSafeInteger(x) && x >= 100 && x < 600,
        'header': 'x-mock-status',
    },
    {
        'name': 'seed',
        'type': 'string',
        'validator': (x) => true,
        'header': 'x-mock-seed',
    },
    {
        'name': 'time',
        'type': 'number',
        'validator': (x) => Number.isSafeInteger(x) && x>=0,
        'header': 'x-mock-time',
    },
    {
        'name': 'size',
        'type': 'object',
        'validator': (x) => true,
        'header': 'x-mock-size',
    },
    {
        'name': 'depth',
        'type': 'number',
        'validator': (x) => Number.isSafeInteger(x) && x >= 0,
        'header': 'x-mock-depth',
    },
    {
        'name': 'example',
        'type': 'string',
        'validator': (x) => ['enabled', 'disabled', 'preferably'].indexOf(x.toLowerCase()) >= 0,
        'header': 'x-mock-example',
    },
    {
        'name': 'override',
        'type': 'object',
        'validator': (x) => true,
        'header': 'x-mock-override',
    },
    {
        'name': 'replay',
        'type': 'number',
        'validator': (x) => Number.isSafeInteger(x) && x >= 0,
        'header': 'x-mock-replay',
    },
    {
        'name': 'replay-pattern',
        'type': 'string',
        'validator': (x) => true,
        'header': 'x-mock-replay-pattern',
    },
];

module.exports = {
    'configRouter': configRouter,
};

/**
 * Returns the router with all the paths for config added
 * @param {Object} options Application options set in startup
 * @throws {Error} Wrong configuration
 * @return {Object} Configured express router
 */
function configRouter(options) {
    router = express.Router();
    if (options['config-back'] === false) {
        throw new Error('config-back is set to false, nothing can be done.');
    }
    if (options['config-ui'] !== false) router.use('/config/ui', express.static(__dirname + '/../../public/config-ui/'));
    router.get('/config/list', getConfigList);
    router.get('/config/', getConfig);
    router.post('/config/', bodyParser.urlencoded({extended: true}), bodyParser.json(), postConfig);
    router.use(injectConfig);
    return router;
}

/**
 * Returns the list of configs set in application
 * @param {Express.Request} req Express request object
 * @param {Express.Response} res Express response object
 * @param {Function} next Express next callback
 */
function getConfig(req, res, next) {
    res.json(config);
}

let validatorStringified = false;
/**
 * Returns the list of configs available in application
 * @param {Express.Request} req Express request object
 * @param {Express.Response} res Express response object
 * @param {Function} next Express next callback
 */
function getConfigList(req, res, next) {
    if (!validatorStringified) {
        configList.forEach((configItem) => configItem.validatorString = configItem.validator.toString());
        validatorStringified = true;
    }
    res.json(configList);
}

/**
 * Adds or overwrites a configuration
 * @param {Express.Request} req Express request object
 * @param {Express.Response} res Express response object
 * @param {Function} next Express next callback
 */
function postConfig(req, res, next) {
    newConfig = req.body;
    let setCounter = 0;
    let unsetCounter = 0;
    configList.forEach((configItem) => {
        let newValue = newConfig[configItem.name];
        if (newValue !== undefined && typeof newValue === configItem.type && configItem.validator(newValue)) {
            config[configItem.name] = newValue;
            setCounter++;
        } else {
            delete config[configItem.name];
        }
    });
    res.json({set: setCounter, unset: unsetCounter, config: config});
}

// TODO: add options from config file and CLI params
/**
 * Adds the config to the request
 * @param {Express.Request} req Express request object
 * @param {Express.Response} res Express response object
 * @param {Function} next Express next callback
 */
function injectConfig(req, res, next) {
    configList.forEach((configItem) => {
        if (config[configItem.name] !== undefined) {
            req.headers[configItem.header] = req.headers[configItem.header] || config[configItem.name];
        }
    });
    next();
}
