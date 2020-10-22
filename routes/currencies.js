const express = require('express');
const { isAuthenticated, isAdmin } = require('../config/auth');
const { formError, systemError } = require('../functions/errors');
const { checkAddCurrencyFormErrors } = require('../functions/currencies');
const router = express.Router();

const Currency = require('../models/currency');

router.post('/', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const createdBy = req.user.id;
        const errors = checkAddCurrencyFormErrors(req.body);
        if (errors.length > 0) {
            next(formError(errors));
        } else {
            const currency = new Currency({ ...req.body, createdBy });
            await currency.save();
            res.json(currency);
        }
    } catch(e) {
        if (e.code == 11000) {
            next(systemError(`A currency with the name ${req.body.name} is already available.`, 406))
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

        const currencies = await Currency.paginate(
            { name: re },
            {
                limit,
                page,
                sort: { [sortBy]: order }
            }
        );
        res.json(currencies);
    } catch (e) {
        console.log(e.message);
        next(systemError(e.message));
    }
});

router.get('/:acronym', async (req, res, next) => {
    try{
        const currency = await Currency.findOne({ acronym: req.params.acronym });
        res.json(currency);
    } catch (e) {
        console.log(e.message);
        next(systemError(e.message));
    }
});

router.delete('/:acronym', async (req, res, next) => {
    try {
        const acronym = req.params.acronym;
        const currency = await Currency.findOne({ acronym: acronym });
        await Currency.deleteOne({ acronym: acronym });
        res.json(currency);
    } catch (e) {
        console.log(e.message);
        next(systemError(e.message));
    }
});

module.exports = router;