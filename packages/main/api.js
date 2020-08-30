const {entries} = require('./log');

function encode(obj, depth = 1) {
    if (obj === undefined) {
        return {$: 'undefined'};
    }

    if (typeof obj === 'function') {
        return {$: 'function', v: typeof obj.name === 'string' ? obj.name : null};
    }

    if (obj === null) {
        return {$: 'null'};
    }

    if (typeof obj !== 'object') {
        return {$: typeof obj, v: obj};
    }

    if (Array.isArray(obj)) {
        if (depth || !obj.length) {
            return {$: 'array', v: obj.map(v => encode(v, depth - 1))};
        } else {
            return {$: 'array'};
        }
    }

    if (depth || !Object.keys(obj).length) {
        return {$: 'object', v: Object.entries(obj).reduce((r, [k, v]) => ({...r, [k]: encode(v, depth - 1)}), {})};
    } else {
        return {$: 'object'};
    }
}

/**
 * @param {*} obj
 * @param {string[]} path
 * @param {number} initialDepth
 */
function getPartialJson(obj, path, initialDepth = 2) {
    if (obj === null || obj === undefined || typeof obj !== 'object' || !path.length) {
        return encode(obj, initialDepth);
    }

    return getPartialJson(obj[path.shift()], path);
}

module.exports = function (server, options = {}) {
    const path = options.path || '/api/System/explain';
    server.get(path, (req, res) => res.json(getPartialJson(entries, req.query.q ? req.query.q.split('.') : [])));
};
