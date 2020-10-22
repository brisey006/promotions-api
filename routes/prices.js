const express = require('express');
const router = express.Router();
const moment = require('moment');
const md5 = require('md5');
const { isAdmin, isAuthenticated } = require('../config/auth');
const { systemError } = require('../functions/errors');

const Promotion = require('../models/promotion');
const Price = require('../models/price');
const Currency = require('../models/currency');

const getPromotion = async (slug) => {
    const promotion = await Promotion.findOne({ slug: slug }).populate([
        {
            path: 'tags'
        },
        {
            path: 'page',
            select: 'name slug'
        },
        {
            path: 'prices'
        }
    ]);
    return promotion;
}

router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const deletedPrice = await Price.findOne({ _id: req.params.id }).populate([{ path: 'currency', select: 'name' }]);
        await Price.deleteOne({ _id: req.params.id });
        res.json(deletedPrice);
    } catch (e) {
        console.log(e.message);
        res.sendStatus(500);
    }
});

module.exports = router;