const checkAddCurrencyFormErrors = (body) => {
    const { name, acronym, symbol } = body;
    const errors = [];
    
    if (!name) {
        errors.push({ field: 'nameError', message: 'Name is required.' });
    }
    
    if (!acronym) {
        errors.push({ field: 'acronymError', message: 'Acronym is required.' });
    }

    if (!symbol) {
        errors.push({ field: 'symbolError', message: 'Symbol is required.' });
    }
    return errors;
}

module.exports = {
    checkAddCurrencyFormErrors
}