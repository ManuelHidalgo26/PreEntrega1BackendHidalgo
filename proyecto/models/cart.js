const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    _id: { type: String, required: true }, 
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1 }
    }]
});

module.exports = mongoose.model('cart', cartSchema);