const express = require('express');
const { isAuthenticated, isAdmin } = require('../config/auth');
const { formError, systemError } = require('../functions/errors');
const { checkCreatePageFormErrors } = require('../functions/pages');
const { slugify } = require('../functions/general');
const router = express.Router();

const Page = require('../models/page');

router.post('/', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const createdBy = req.user.id;
        const errors = checkCreatePageFormErrors(req.body);
        if (errors.length > 0) {
            next(formError(errors));
        } else {
            const slug = slugify(req.body.name);
            const page = new Page({ ...req.body, slug, createdBy });
            await page.save();
            res.json(page);
        }
    } catch(e) {
        if (e.code == 11000) {
            next(systemError(`A page with the name ${req.body.name}`))
        } else {
            console.log(e.message);
            res.sendStatus(500);
        }
    }
});

router.get('/', async (req, res, next) => {
    try {
        const page = req.query.page != undefined ? req.query.page : 1;
        const limit = req.query.limit != undefined ? req.query.limit : 10;
        const query = req.query.query != undefined ? req.query.query : '';
        const sortBy = req.query.sort != undefined ? req.query.sort : 'createdAt';
        const order = req.query.order != undefined ? req.query.order : -1;

        const re = new RegExp(query, "gi");

        const pages = await Page.paginate(
            { name: re },
            {
                limit,
                page,
                sort: { [sortBy]: order }
            }
        );
        res.json(pages);
    } catch (e) {
        next(systemError(e.message));
    }
});

router.get('/:slug', async (req, res, next) => {
    try{
        const page = await Page.findOne({ slug: req.params.slug });
        res.json(page);
    } catch (e) {
        console.log(e.message);
        next(systemError(e.message));
    }
});

module.exports = router;