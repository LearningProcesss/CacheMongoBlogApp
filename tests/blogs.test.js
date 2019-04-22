const Page = require('./helper/page');
const Action = require('../tests/helper/actions');

let page;

beforeEach(async () => {
    page = await Page.build();

    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When log in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.goto('localhost:3000/blogs');
        await page.click('a.btn-floating');
    });

    test('blog create form visible', async () => {
        const label = await page.getInnerHtmlOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('using valid inputs', async () => {

        beforeEach(async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async () => {
            const text = await page.getInnerHtmlOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting then saving adds blog', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getInnerHtmlOf('.card-title');
            const content = await page.getInnerHtmlOf('.card-content');

            expect(title).toEqual('My Title');
        });
    });

    describe('using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });
        test('should see error message invalid inputs', async () => {
            const titleError = await page.getInnerHtmlOf('.title .red-text');
            const contentError = await page.getInnerHtmlOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    });

});

describe('When user not sign in', async () => {
    // const actions = [
    //     {
    //         method: 'get',
    //         path: '/api/blogs'
    //     },
    //     {
    //         method: 'post',
    //         path: '/api/blogs',
    //         data: {
    //             title: 'Titolo test',
    //             content: 'Content test'
    //         }
    //     }
    // ];

    const actions = [
        Action.build('get', '/api/blogs', null),
        Action.build('post', '/api/blogs', { data: { titolo: 'test', content: 'content'}})
    ];

    test('Blog actions not permitted', async () => {
        // const results = await page.execMultipleReqs(actions);
        const results = await page.e(actions);

        for (const result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }
    });



    // test('User cannot create blog', async () => {
    //     const result = await page.post('/api/blogs', {
    //         title: 'Test blog title',
    //         content: 'Test blog content'
    //     });

    //     expect(result).toEqual({ error: 'You must log in!' });
    // });

    // test('User cannot get blogs', async () => {
    //     const result = await page.get('/api/blogs');

    //     expect(result).toEqual({ error: 'You must log in!' });
    // });
});