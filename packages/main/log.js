const entries = {};

class Entry {
    constructor(id, success, ctx, log) {
        this.id = id;
        this.method = ctx.req.method;
        this.url = ctx.req.url;
        this.timestamp = new Date().toISOString();
        this.success = success;
        this.ctx = ctx;
        this.log = log;
    }
}

entries.test = new Entry('test', true, {req: {method: 'GET'}, url: '/test'}, []);

module.exports = {
    entries,
    Entry,
};
