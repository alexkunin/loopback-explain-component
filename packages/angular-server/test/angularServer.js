const angularServer = require('../index');
const express = require('express');
const supertest = require('supertest');
const path = require("path");

const makeUut = (options = {}) => {
    const app = express();

    app.use(angularServer({
        webRoot: path.join(__dirname, 'fixtures/test_dist'),
        ...options,
    }));

    // To indicate fall-through:
    app.use((req, res) => res.sendStatus(567));

    return supertest(app);
};

describe('angularServer', () => {
    describe('index', () => {
        const checkIndex = (url, done) =>
            makeUut()
                .get(url)
                .expect('Content-Type', /html/)
                .expect(/Sample Index/)
                .expect(200, done);

        it('should be returned for root', done => {
            checkIndex('/', done);
        });

        it('should be returned for explicit request', done => {
            checkIndex('/index.html', done);
        });

        it('should be returned for any non-existing path', done => {
            checkIndex('/some/page/deep/inside/', done);
        });
    });

    describe('assets MIME type', () => {
        it('should be valid for .css', done => {
            makeUut()
                .get('/style.css')
                .expect('Content-Type', /css/)
                .expect(/\.css-class/)
                .expect(200, done);
        });

        it('should be valid for .js', done => {
            makeUut()
                .get('/script.js')
                .expect('Content-Type', /javascript/)
                .expect(/console\.log/)
                .expect(200, done);
        });
    });

    describe('base href', () => {
        it('should be replaced if configured', done => {
            makeUut({baseHref: '/other/path/'})
                .get('/other/path/')
                .expect(/<base href="\/other\/path\/">/)
                .expect(200, done);
        });

        it('should be replaced with "/" if not configured', done => {
            makeUut()
                .get('/')
                .expect(/<base href="\/">/)
                .expect(200, done);
        });

        it('should limit request serving only to configured value', done => {
            makeUut({baseHref: '/other/path/'})
                .get('/anything/else')
                .expect(567, done);
        });
    });

    describe('environment', () => {
        it('should add expando to window', done => {
            makeUut({env: {abc: '123'}, inject: 'expando', expandoVar: '__var'})
                .get('/')
                .expect(/window\.__var\["abc"]\s*=\s*"123"/)
                .expect(200, done);
        });

        it('should serve separate JSON file', done => {
            makeUut({baseHref: '/base/', env: {abc: '123'}, inject: 'json', jsonPath: 'test/config.json'})
                .get('/base/test/config.json')
                .expect('Content-Type', /json/)
                .expect(/"abc":\s*"123"/)
                .expect(200, done);
        });

        it('should do individual substitutions', done => {
            makeUut({env: {abc: '123', def: '456'}, inject: 'subst'})
                .get('/')
                .expect(/envsubst example abc=123/)
                .expect(/go format example def=456/)
                .expect(200, done);
        });
    });
});
