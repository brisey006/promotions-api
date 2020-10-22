const express = require('express');
const router = express.Router();
const moment = require('moment');
const md5 = require('md5');
const { isAdmin, isAuthenticated } = require('../config/auth');
const { checkPromotionFormErrors, getTags } = require('../functions/promotions');
const { checkPricesFormErrors } = require('../functions/prices');
const { slugify } = require('../functions/general');
const { formError, systemError } = require('../functions/errors');

const Promotion = require('../models/promotion');
const Price = require('../models/price');
const Currency = require('../models/currency');

const getPromotion = async (slug) => {
    const promotion = await Promotion.findOne({ slug: slug }).populate([
        {
            path: 'tags'
        },
        {
            path: 'page'
        },
        {
            path: 'prices'
        }
    ]);
    return promotion;
}

router.post('/', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const createdBy = req.user.id;
        const errors = checkPromotionFormErrors(req.body);
        if (errors.length > 0) {
            next(formError(errors));
        } else {
            const expiry = moment(req.body.expiry, 'YYYY-MM-DD');
            const slug = slugify(req.body.title);
            const tags = await getTags(req.body.tags);
            const promotion = new Promotion({ ...req.body, slug, expiry, createdBy, tags, page: req.body.pageId });
            await promotion.save();
            res.json(promotion);
        }
    } catch(e) {
        if (e.code == 11000) {
            console.log(e.message);
            next(systemError(`A promotion with the title ${req.body.title} is already available.`, 406))
        } else {
            console.log(e.message);
            res.sendStatus(500);
        }
    }
});

router.post('/:slug/add-price', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const errors = checkPricesFormErrors(req.body);
        if (errors.length == 0) {
            const { currency, was, now, promotion } = req.body;
            const key = md5(`${currency}${promotion}`);
            const price = new Price({ currency, was, now, promotion, key });
            await price.save();
            await Promotion.updateOne({ _id: promotion }, { $push: { prices: price._id } });
            const updatedPromotion = await getPromotion(req.params.slug);
            res.json({ promotion: updatedPromotion });
        } else {
            next(formError(errors));
        }
    } catch (e) {
        if (e.code == 11000) {
            console.log(e.message);
            const currency = await Currency.findOne({ _id: req.body.currency });
            next(systemError(`${currency.name} price is already available.`, 406))
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

        const promotions = await Promotion.paginate(
            { title: re, approved: true, active: true },
            {
                limit,
                page,
                sort: { [sortBy]: order },
                populate: [
                    {
                        path: 'page',
                        select: 'name slug'
                    },
                    {
                        path: 'prices',
                        populate: 'currency'
                    }
                ]
            }
        );
        res.json(promotions);
    } catch (e) {
        next(systemError(e.message));
    }
});

router.get('/admin', async (req, res, next) => {
    try {
        const page = req.query.page != undefined ? req.query.page : 1;
        const limit = req.query.limit != undefined ? req.query.limit : 10;
        const query = req.query.query != undefined ? req.query.query : '';
        const sortBy = req.query.sort != undefined ? req.query.sort : 'createdAt';
        const order = req.query.order != undefined ? req.query.order : -1;

        const re = new RegExp(query, "gi");

        const promotions = await Promotion.paginate(
            { title: re },
            {
                limit,
                page,
                sort: { [sortBy]: order },
                populate: [
                    {
                        path: 'page',
                        select: 'name slug'
                    }
                ]
            }
        );
        res.json(promotions);
    } catch (e) {
        next(systemError(e.message));
    }
});

router.get('/:slug', async (req, res) => {
    try {
        if (!req.query.admin) {
            await Promotion.updateOne({ slug: req.params.slug }, { $inc: { hits: 1 } });
        }
        const promotion = await getPromotion(req.params.slug);
        res.json(promotion);
    } catch (e) {
        console.log(e.message);
        res.sendStatus(500);
    }
});

router.put('/:slug', isAuthenticated, async (req, res, next) => {
    try {
        await Promotion.updateOne({ slug: req.params.slug }, { $set: req.body });
        const promotion = await getPromotion(req.params.slug);
        res.json(promotion);
    } catch (e) {
        console.log(e.message);
        res.sendStatus(500);
    }
});

router.put('/:slug/approve', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const slug = req.params.slug;
        const { approved } = req.body;
        const promotion = await Promotion.findOne({ slug: slug });
        if (promotion.step == 2) {
            await Promotion.updateOne({ slug }, { $set: { approved, active: approved } });
            res.json(promotion);
        } else {
            next(systemError('Failed to approve. Promotion setup not completed.', 406));
        }
    } catch (e) {
        console.log(e.message);
        res.sendStatus(e);
    }
});

router.delete('/:slug', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const promotion = await getPromotion(req.params.slug);
        await Promotion.deleteOne({ slug: req.params.slug });
        res.json(promotion);
    } catch (e) {
        console.log(e.message);
        res.sendStatus(500);
    }
});

router.get('/:slug/prices', async (req, res, next) => {
    try {
        const promotion = await Promotion.findOne({ slug: req.params.slug });
        const data = await Price.find({ promotion: promotion._id }).populate([{
            path: 'currency',
            select: 'name acronym symbol'
        }]);

        let initPoint = 0;
        const prices = [];

        for (x of data) {
            initPoint += 1;
            const newPrice = { ...x._doc, position: initPoint };
            prices.push(newPrice);
        }
        
        res.json(prices);
    } catch (e) {
        console.log(e.message);
        res.sendStatus(500);
    }
});

module.exports = router;