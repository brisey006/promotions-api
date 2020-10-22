const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PromotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    description: String,
    slug: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    displayImage: {
        original: String,
        thumbnail: String
    },
    prices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Price' }],
    active: {
        type: Boolean,
        default: false
    },
    step: {
        type: Number,
        default: 0
    },
    hits: {
        type: Number,
        default: 0
    },
    approved: {
        type: Boolean,
        default: false
    },
    expiry: Date,
    page: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId }
}, {
    timestamps: true
});

PromotionSchema.set('toJSON', {
    getters: true,
    transform: (doc, ret) => {
      if (ret.was) {
        ret.was = ret.was.toString();
      }
      if (ret.now) {
        ret.now = ret.now.toString();
      }
      delete ret.__v;
      return ret;
    },
  });

PromotionSchema.plugin(mongoosePaginate);
const Promotion = mongoose.model('Promotion', PromotionSchema);

module.exports = Promotion;