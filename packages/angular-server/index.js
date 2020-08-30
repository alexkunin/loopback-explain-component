const express = require('express');
const path = require('path');
const fs = require('fs');

const defaultOptions = {
    webRoot: null,
    baseHref: '/',
    index: 'index.html',
    env: process.env
};

module.exports = function angularServer(options) {
    const resolvedOptions = {...defaultOptions, ...options};
    const base = resolvedOptions.baseHref.replace(/\/+$/, '') + '/';
    const indexFile = path.join(resolvedOptions.webRoot, resolvedOptions.index);

    const serveDynamicIndex = (req, res) => {
        fs.readFile(indexFile, (err, buffer) => {
            if (err) {
                throw err;
            }

            const original = buffer.toString();
            const modified = original
                .replace(/<base href="[^"]*">/g, '<base href="' + base + '">')
                .replace(/{{ \.Env\.(\w+) }}/g, (_, name) => {
                    const value = (resolvedOptions.env)[name];
                    return typeof value === 'string' ? value : '';
                })
                .replace(/\${(\w+)}/g, (_, name) => {
                    const value = (resolvedOptions.env)[name];
                    return typeof value === 'string' ? value : '';
                });
            res.send(modified);
        });
    };

    const router = express.Router();

    router.get(
        [
            base,
            path.join(base, resolvedOptions.index)
        ],
        serveDynamicIndex
    );

    router.use(
        base,
        express.static(resolvedOptions.webRoot, {index: false}),
        serveDynamicIndex
    );

    return router;
};
