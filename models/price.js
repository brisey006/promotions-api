const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PriceSchema = new mongoose.Schema({
    currency: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Currency',
        required: true
    },
    promotion: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Promotion',
        required: true
    },
    key: {
        type: String,
        index: true,
        unique: true,
        sparse: true
    },
    was: Number,
    now: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

PriceSchema.plugin(mongoosePaginate);
const Price = mongoose.model('Price', PriceSchema);

module.exports = Price;