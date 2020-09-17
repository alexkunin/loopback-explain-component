const {webRoot} = require('@explain-component-internals/ui-client');
const angularServer = require('@explain-component-internals/angular-server');
const hooks = require('./hooks');
const api = require('./api');
const {URL} = require('universal-url');

module.exports = (app, options = {}) => {
    const resolvedOptions = options;
    const triggerParamName = resolvedOptions.triggerParamName || 'explain';
    const apiPath = resolvedOptions.apiPath || '/api/System/explain';
    const uiPath = resolvedOptions.uiPath || '/explain';
    app.use(angularServer({
        webRoot,
        baseHref: uiPath,
        env: {
            API_URL: apiPath,
        },
    }));
    hooks(app, {triggerParamName});
    api(app, {path: apiPath});
    app.on('started', () => console.log('Browse your explain UI at %s', new URL(uiPath, app.get('url')).href));
};
