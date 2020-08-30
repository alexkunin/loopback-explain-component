const globalDebug = require('debug');
const uuid = require('uuid/v4');
const {entries, Entry} = require('./log');

const debug = globalDebug('explain-component:main:hooks');

function intercept(mask) {
    const re = /node_modules\/debug\/(src\/index|debug)\.js$/;
    const oldMask = process.env.DEBUG;
    const entries = [];

    function interceptOne({exports, exports: {log}}) {
        exports.log = (...args) => {
            entries.push(args);
            return log.apply(exports, args);
        };
        exports.enable(mask);
        return {
            finalize() {
                exports.log = log;
                exports.enable(oldMask);
            }
        };
    }

    const finalizers = Object.entries(require('module')._cache)
        .filter(
            ([path, module]) =>
                re.test(path)
                && module
                && module.exports
                && module.exports.log instanceof Function
                && module.exports.enable instanceof Function
        )
        .map(([, module]) => interceptOne(module));
    return {
        finalize() {
            finalizers.forEach(o => o.finalize());
            return entries;
        }
    }
}

class ExplainWrapper {
    constructor(ctx, options, entryId) {
        debug('ExplainWrapper#constructor', this.parseOptions(options));
        this.ctx = ctx;
        this.options = this.parseOptions(options);
        this.entryId = entryId;
        this.interceptor = intercept(this.getMask());
    }

    parseOptions(options) {
        return options.charAt(0) === '{' ? JSON.parse(options) : {debug: options};
    }

    getMask() {
        return typeof this.options.debug === 'string' ? this.options.debug : '*';
    }

    finalize(success) {
        const log = this.interceptor.finalize();
        this.ctx.res.setHeader('X-Explain-Link', `/api/System/explain?id=${encodeURIComponent(this.entryId)}`);
        debug('ExplainWrapper#finalize', this.options, success)
        return new Entry(this.entryId, success, this.ctx, log);
    }
}

module.exports = function (server, options = {}) {
    const triggerParamName = options.triggerParamName || 'explain';

    const map = new WeakMap();

    function start(ctx) {
        const options = ctx.req.query[triggerParamName];
        if (typeof options === 'string') {
            debug('triggered for method "%s" with options %o', ctx.method.stringName, options);
            map.set(ctx, new ExplainWrapper(ctx, options, uuid()));
        }
    }

    function stop(ctx, success) {
        if (map.has(ctx)) {
            const entry = map.get(ctx).finalize(success);
            entries[entry.id] = entry;
            map.delete(ctx);
            return entry;
        }
    }

    server.remotes().phases.first().before((ctx, done) => {
        start(ctx);
        done();
    });
    server.remotes().after('**', async ctx => stop(ctx, true));
    server.remotes().afterError('**', async ctx => stop(ctx, false));
};
