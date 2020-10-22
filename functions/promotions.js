const Tag = require('../models/tag');
const { slugify } = require('../functions/general');

const checkPromotionFormErrors = (body) => {
    const { title, description, expiry, pageId } = body;
    const errors = [];
    
    if (!title) {
        errors.push({ field: 'titleError', message: 'Title is required.' });
    }
    
    if (!description) {
        errors.push({ field: 'descriptionError', message: 'Description is required.' });
    }

    if (!expiry) {
        errors.push({ field: 'expiryError', message: 'Promotion expiry date is required.' });
    }

    if (!pageId) {
        errors.push({ field: 'pageError', message: 'Page is required.' });
    }
    return errors;
}

const getTags = async (tagsString) => {
    const tagsArray = tagsString.split(',');
    const tags = [];
    if (tagsArray.length > 0) {
        for (rawTag of tagsArray) {
            const name = rawTag.toLowerCase();
            const tag = await Tag.findOne({ name });

            if (tag) {
                tags.push(tag._id);
            } else {
                const newTag = new Tag({ name, slug: slugify(name) });
                await newTag.save();
                tags.push(newTag._id);
            }
        }
    }
    return tags;
}

module.exports = {
    checkPromotionFormErrors,
    getTags
}