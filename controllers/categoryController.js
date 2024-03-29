var Category = require('../models/category');
var async = require('async');
var Product = require('../models/product')
const { body, validationResult } = require("express-validator");


exports.index = async function (req, res) {
  const category_home = ['62cbec3cfb89ebba3a539320', '62cbec3dfb89ebba3a539323', '62d0def41732eab67814408e']
  const productNum = await Product.countDocuments()
  const categoryNum = await Category.countDocuments()
    Category.find().where('_id').in(category_home).exec(function (err, list_categories) {
      if (err) { return next(err); }
      res.render('index', { title: 'Front page', list_categories:  list_categories, categoryNum, productNum});
    });
};

// Display list of all category.
exports.category_list = function(req, res) {
    Category.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_categories) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('category_list', { title: 'Category List', list_categories:  list_categories});
    });

};

// Display detail page for a specific Category.
exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_products: function(callback) {
            Product.find({ 'category': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_products: results.category_products } );
    });

};


// Display Category create form on GET.
exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create Category' });
  };
  

// Handle Category create on POST.
exports.category_create_post =  [

    // Validate and sanitize the name field.
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Category with same name already exists.
        Category.findOne({ 'name': req.body.name })
          .exec( function(err, found_category) {
             if (err) { return next(err); }
  
             if (found_category) {
               // Category exists, redirect to its detail page.
               res.redirect(found_category.url);
             }
             else {
  
               category.save(function (err) {
                 if (err) { return next(err); }
                 // Category saved. Redirect to category detail page.
                 res.redirect(category.url);
               });
  
             }
  
           });
      }
    }
  ];
  
// Display Category delete form on GET.
exports.category_delete_get = function(req, res, next) {

  async.parallel({
      category: function(callback) {
          Category.findById(req.params.id).exec(callback);
      },
      category_products: function(callback) {
          Product.find({ 'category': req.params.id }).exec(callback);
      },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.category==null) { // No results.
          res.redirect('/catalog/categories');
      }
      // Successful, so render.
      res.render('category_delete', { title: 'Delete Category', results:results, category: results.category, category_products: results.category_products } );
  });

};

// Handle Category delete on POST.
exports.category_delete_post = function(req, res, next) {

  async.parallel({
      category: function(callback) {
          Category.findById(req.params.id).exec(callback);
      },
      category_products: function(callback) {
          Product.find({ 'category': req.params.id }).exec(callback);
      },
  }, function(err, results) {
      if (err) { return next(err); }
      // Success
      if (results.category_products.length > 0) {
          // Category has products. Render in same way as for GET route.
          res.render('category_delete', { title: 'Delete Category', category: results.category, category_products: results.category_products } );
          return;
      }
      else {
          // Category has no products. Delete object and redirect to the list of categories.
          Category.findByIdAndRemove(req.body.id, function deleteCategory(err) {
              if (err) { return next(err); }
              // Success - go to categories list.
              res.redirect('/catalog/categories');
          });

      }
  });

};

// Display Category update form on GET.
exports.category_update_get = function(req, res, next) {

  Category.findById(req.params.id, function(err, category) {
      if (err) { return next(err); }
      if (category==null) { // No results.
          var err = new Error('Category not found');
          err.status = 404;
          return next(err);
      }
      // Success.
      res.render('category_form', { title: 'Update Category', category: category });
  });

};

// Handle Category update on POST.
exports.category_update_post = [
 
  // Validate and sanitze the name field.
  body('name', 'Category name must contain at least 3 characters').trim().isLength({ min: 3 }).escape(),
  

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request .
      const errors = validationResult(req);

  // Create a category object with escaped and trimmed data (and the old id!)
      var category = new Category(
        {
        name: req.body.name,
        _id: req.params.id
        }
      );


      if (!errors.isEmpty()) {
          // There are errors. Render the form again with sanitized values and error messages.
          res.render('category_form', { title: 'Update Category', category: category, errors: errors.array()});
      return;
      }
      else {
          // Data from form is valid. Update the record.
          Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
              if (err) { return next(err); }
                 // Successful - redirect to category detail page.
                 res.redirect(thecategory.url);
              });
      }
  }
];