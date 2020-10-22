const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    description: String,
    address: String,
    phoneNumber: String,
    email: String,
    country: String,
    city: String,
    location: {
        lat: Number,
        long: Number
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    displayImage: {
        original: String,
        thumbnail: String
    },
    step: {
        type: Number,
        default: 1
    },
    approved: {
        type: Boolean,
        default: false
    },
    managers: [
        { 
            type: mongoose.Schema.Types.ObjectId
        }
    ],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

PageSchema.plugin(mongoosePaginate);
const Page = mongoose.model('Page', PageSchema);

module.exports = Page;