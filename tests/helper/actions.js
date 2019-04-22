class Action {

    constructor(method, path, data) {
        this.path = path;
        this.method = method;
        this.data = data;
    }

    static build(method, path, data) {
        return new Action(method, path, data);
    }
}

module.exports = Action;