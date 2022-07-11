var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AccessorySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    categories: [{
      type: Schema.ObjectId,
      ref: 'Categories'
    }],
    price: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      min: 0,
    }
  }
);

AccessorySchema
  .virtual('url')
  .get(function () {
    return '/catalog/accessory/' + this._id;
  });

module.exports = mongoose.model('Accessory', AccessorySchema);