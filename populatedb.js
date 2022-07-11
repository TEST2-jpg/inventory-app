#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Product = require('./models/product')
var Category = require('./models/category')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var products = []


function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function productCreate(name, description, price, stock, type, category, cb) {
  productdetail = { 
    name: name,
    description: description,
    price: price,
    stock: stock,
    type: type,
  }
  if (category != false) productdetail.category = category
    
  var product = new Product(productdetail);    
  product.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New product: ' + product);
    products.push(product)
    cb(null, product)
  }  );
}


function createCategory(cb) {
    async.series([
       
        function(callback) {
          categoryCreate("Components", callback);
        },
        function(callback) {
          categoryCreate("Accessories", callback);
        },
        function(callback) {
          categoryCreate("Software", callback);
        },
        function(callback) {
          categoryCreate("Others", callback);
        },
        function(callback) {
          categoryCreate("d ERTERT", callback);
        },
        ],
        // optional callback
        cb);
}


function createProducts(cb) {
    async.parallel([
        function(callback) {
          productCreate('Nvidia RTX 3070', 'The GeForce RTXTM 3070 Ti and RTX 3070 graphics cards are powered by Ampere—NVIDIA’s 2nd gen RTX architecture. Built with enhanced Ray Tracing Cores and Tensor Cores, new streaming multiprocessors, and high-speed memory', 500, 13, 'Graphics Card',  [categories[0],], callback);
        },
        function(callback) {
          productCreate("Keychron Q2 Mechanical Keyboard", 'etting the best example for efficient space usage, the Q5 has a compact 96% layout design while retaining all the essential functions and number keys. With its full metal CNC machined body, double-gasket design', 149.21, 3,'Keyboard' , [categories[1],], callback);
        },
        function(callback) {
          productCreate('Logitech MX Master 2S', 'ou’ve never seen a computer like this before. With a strikingly thin design made possible by the Apple M1 chip. An immersive 24-inch 4.5K Retina display with ov', 69.9, 15,'Mouse', [categories[0],categories[1]], callback);
        },
        function(callback) {
          productCreate('Dell Inspiron 15 3000', 'he GeForce RTX™ 2060 is powered by the NVIDIA Turing™ architecture, bringing incredible performance and the power of real-time ray tracing and AI to the latest ',278.94, 3,'Laptop' ,false, callback)
        }
        ],
        // optional callback
        cb);
}


async.series([
    createCategory,
    createProducts,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



