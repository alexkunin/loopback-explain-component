const express = require('express');
const path = require('path');
const fs = require('fs');

const defaultOptions = {
    webRoot: null,
    baseHref: '/',
    index: 'index.html',
    env: process.env,
    inject: 'subst',
    expandoVar: '__ENV',
    jsonPath: 'config.json',
};

function formatExpandoBlock(env, varName) {
    return [
        '<script>',
        `window.${varName} = window.${varName}||{};`,
        ...Object.entries(env).map(([k, v]) => `window.${varName}[${JSON.stringify(k)}] = ${JSON.stringify(v)};`),
        '</script>'
    ].join("\n");
}

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
            let modified = original
                .replace(/<base href="[^"]*">/g, '<base href="' + base + '">');

            if (resolvedOptions.inject === 'subst') {
                modified = modified
                    .replace(/{{ \.Env\.(\w+) }}/g, (_, name) => {
                        const value = (resolvedOptions.env)[name];
                        return typeof value === 'string' ? value : '';
                    })
                    .replace(/\${(\w+)}/g, (_, name) => {
                        const value = (resolvedOptions.env)[name];
                        return typeof value === 'string' ? value : '';
                    });
            }


            if (resolvedOptions.inject === 'expando') {
                const pos = modified.indexOf('<\/head>');
                if (pos === -1) {
                    throw new Error('Cannot add expando: closing <head> tag not found');
                }
                modified = modified.slice(0, pos) + formatExpandoBlock(resolvedOptions.env, resolvedOptions.expandoVar) + modified.slice(pos);
            }

            res.send(modified);
        });
    };

    const router = express.Router();

    if (resolvedOptions.inject === 'json') {
        router.get(
            path.join(base, resolvedOptions.jsonPath),
            (req, res) => res.json(resolvedOptions.env)
        );
    }

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
