const Page = require('../tests/helper/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('Launch browser', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
});

test('click login oauth', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test.only('sign in, show logout', async () => {
    await page.login();

    const text = await page.getInnerHtmlOf('a[href="/auth/logout"]');

    expect(text).toEqual('Logout');
});