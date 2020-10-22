module.exports = {
    formError: (errors) => {
        const error = new Error(JSON.stringify(errors));
        error.status = 406;
        return error;
    },
    systemError: (message, status) => {
        const messageObj = { field: 'system', message };
        const error = new Error(JSON.stringify([messageObj]));
        error.status = status;
        return error;
    }
}