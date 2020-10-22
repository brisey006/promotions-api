const checkCreatePageFormErrors = (body) => {
    const { name, description, address, phoneNumber } = body;
    const errors = [];
    
    if (!name) {
        errors.push({ field: 'nameError', message: 'Name is required.' });
    }
    
    if (!description) {
        errors.push({ field: 'descriptionError', message: 'Description is required.' });
    }

    if (!address) {
        errors.push({ field: 'addressError', message: 'Address is required.' });
    }

    if (!phoneNumber) {
        errors.push({ field: 'phoneError', message: 'Phone number is required.' });
    }
    return errors;
}

module.exports = {
    checkCreatePageFormErrors
}