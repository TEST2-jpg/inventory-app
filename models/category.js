var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: {type: String, required: true, minLength: 1, maxLength: 100}
});

// Virtual for this genre instance URL.
CategorySchema
.virtual('url')
.get(function () {
  return '/catalog/category/'+this._id;
});

// Export model.
module.exports = mongoose.model('Category', CategorySchema);