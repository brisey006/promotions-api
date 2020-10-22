const express = require('express');
const router = express.Router();

router.use('/pages', require('./pages'));
router.use('/currencies', require('./currencies'));
router.use('/promotions', require('./promotions'));
router.use('/prices', require('./prices'));

module.exports = router;