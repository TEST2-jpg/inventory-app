var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategoriesSchema = new Schema({
    name: {type: String, required: true, minLength: 3, maxLength: 100}
});

// Virtual for this genre instance URL.
CategoriesSchema
.virtual('url')
.get(function () {
  return '/catalog/categories/'+this._id;
});

// Export model.
module.exports = mongoose.model('Categories', CategoriesSchema);