const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CurrencySchema = new mongoose.Schema({
    acronym: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    name: String,
    symbol: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId }
}, {
    timestamps: true
});

CurrencySchema.plugin(mongoosePaginate);
const Currency = mongoose.model('Currency', CurrencySchema);

module.exports = Currency;