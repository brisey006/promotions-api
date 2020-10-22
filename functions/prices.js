const checkPricesFormErrors = (body) => {
    const { currency, was, now, promotion } = body;
    const errors = [];
    
    if (!currency) {
        errors.push({ field: 'currencyError', message: 'Currency is required.' });
    }
    
    if (!was) {
        errors.push({ field: 'wasError', message: 'An original price is required.' });
    }

    if (!now) {
        errors.push({ field: 'nowError', message: 'A discounted error is required.' });
    }

    if (!promotion) {
        errors.push({ field: 'promotionError', message: 'A promotion is required.' });
    }

    if (errors.length > 0) {
        errors.push({ field: 'system', message: 'Fill in the required fields.' });
    }
    return errors;
}

module.exports = {
    checkPricesFormErrors
}