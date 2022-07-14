var Product = require('../models/product');
var Category = require('../models/category')
var async = require('async');
const { body, validationResult } = require('express-validator');


exports.product_list = function (req, res, next) {

    Product.find({}, 'name price')
        .sort({ title: 1 })
        .exec(function (err, list_product) {
            if (err) { return next(err); }
            res.render('product_list', { title: 'Product List', product_list: list_product });
        });

};


// Display detail page for a specific product.
exports.product_detail = function (req, res, next) {

    async.parallel({
        product: function (callback) {

            Product.findById(req.params.id)
                .populate('category')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.product == null) { // No results.
            var err = new Error('Product not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('product_detail', { name: results.product.name, product: results.product, });
    });

};


// Display product create form on GET.
exports.product_create_get = function (req, res, next) {

    // Get all category, which we can use for adding to our product.
    async.parallel({
        category: function (callback) {
            Category.find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('product_form', { title: 'Create Product', category: results.category });
    });

};


// Handle product create on POST.
exports.product_create_post = [
    // Convert the category to an array.
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category ==='undefined')
            req.body.category = [];
            else
            req.body.category = new Array(req.body.category);
        }
        next();
    },

    body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'price must not be empty').trim().notEmpty().escape(),
    body('stock', 'stock must be a whole number').trim().notEmpty().isInt().escape(),
    body('type', 'type must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Product object with escaped and trimmed data.
        var product = new Product(
          { name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            type: req.body.type,
            category: req.body.category
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and categories for form.
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (product.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('product_form', { title: 'Create Product', categories:results.categories, product: product, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save product.
            product.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new product record.
                   res.redirect(product.url);
                });
        }
    }
];


// Display product delete form on GET.
exports.product_delete_get = function(req, res, next) {

    Product.findById(req.params.id)
    .exec(function (err, product) {
        if (err) { return next(err); }
        if (product==null) { // No results.
            res.redirect('/catalog/products');
        }
        // Successful, so render.
        res.render('product_delete', { title: 'Delete Product', product:  product});
    })

};

// Handle product delete on POST.
exports.product_delete_post = function(req, res, next) {

    Product.findByIdAndRemove(req.body.id, function deleteProduct(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of BookInstance items.
        res.redirect('/catalog/products');
        })

};

// Display product update form on GET.
exports.product_update_get = function(req, res, next) {

    // Get product, authors and categories for form.
    async.parallel({
        product: function(callback) {
            Product.findById(req.params.id).populate('category').exec(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.product==null) { // No results.
                var err = new Error('Product not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected categories as checked.
            for (var all_g_iter = 0; all_g_iter < results.categories.length; all_g_iter++) {
                for (var product_g_iter = 0; product_g_iter < results.product.category.length; product_g_iter++) {
                    if (results.categories[all_g_iter]._id.toString()===results.product.category[product_g_iter]._id.toString()) {
                        results.categories[all_g_iter].checked='true';
                    }
                }
            }
            res.render('product_form', { title: 'Update Product', results: results, categories: results.categories, product: results.product });
        });

};


// Handle product update on POST.
exports.product_update_post = [

    // Convert the category to an array.
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category==='undefined')
            req.body.category=[];
            else
            req.body.category=new Array(req.body.category);
        }
        next();
    },
   
    // Validate and sanitize fields.
    body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'price must not be empty').trim().notEmpty().escape(),
    body('stock', 'stock must be a whole number').trim().notEmpty().isInt().escape(),
    body('type', 'type must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Product object with escaped/trimmed data and old id.
        var product = new Product(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            category: (typeof req.body.category==='undefined') ? [] : req.body.category,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and categories for form
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (product.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('product_form', { title: 'Update Product', categories: results.categories, product: product, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Product.findByIdAndUpdate(req.params.id, product, {}, function (err,theproduct) {
                if (err) { return next(err); }
                   // Successful - redirect to product detail page.
                   res.redirect(theproduct.url);
                });
        }
    }
];