const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 8083;

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(`mongodb://${process.env.DB_PATH || 'localhost'}:27017/promotionsdb`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => console.log('MongoDb fired up!'));

app.use('/', require('./routes'));

app.use((req, res, next) => {
    const error = new Error(JSON.stringify(['Not Found.']));
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ errors: error.message });
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});