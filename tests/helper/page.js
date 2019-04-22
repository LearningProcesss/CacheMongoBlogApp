const puppeteer = require('puppeteer');
const sessionFactory = require('../factory/sessionFactory');
const userFactory = require('../factory/userFactory');
const Action = require('./actions');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();

        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }
    async login() {
        const user = await userFactory.getUser('5cbade4a564e06ee834f7808');

        const { sessionString, sig } = sessionFactory(user._id);

        await this.page.setCookie({ name: 'session', value: sessionString });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('localhost:3000');
        await this.page.waitFor('a[href="/auth/logout"]', el => el.innerHTML);
    }
    async getInnerHtmlOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
    /**
     * @param  {string} path
     */
    get(path) {
        return this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        }, path)
    }
    /**
     * @param  {string} path
     * @param  {object} body
     */
    post(path, data) {
        return this.page.evaluate((_path, _data) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_data)
            }).then(res => res.json());
        }, path, data);
    }
    /**
     * @param  {Array} actions
     */
    execMultipleReqs(actions) {
        return Promise.all(
            actions.map(({ method, path, data }) => {
                return this[method](path, data);
            })
        );
    }
    /**
     * @param  {Action[]} actions
     */
    e(actions) {
        return Promise.all(
            actions.map(a => {
                return this[a.method](a.path, a.data);
            })
        );
    }
}

module.exports = CustomPage;