var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    stock: {type: Number, required: true},
    category: [{ type: Schema.ObjectId, ref: 'Category' }]
});

// Virtual for this book instance URL.
ProductSchema
.virtual('url')
.get(function () {
  return '/catalog/product/'+this._id;
});

// Export model.
module.exports = mongoose.model('Product', ProductSchema);