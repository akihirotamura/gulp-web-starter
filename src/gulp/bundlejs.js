'use strict';

var $             = [];
var babelify      = require('babelify');
var browserify    = require('browserify');
var buffer        = require('vinyl-buffer');
var functions     = require('./functions.js');
var gulp          = require('gulp');
var merge         = require('merge-stream');
var path          = require('path');
var paths         = require('./config.js').paths;
var source        = require('vinyl-source-stream');
var watchify      = require('watchify');

$.sourcemaps      = require('gulp-sourcemaps');
$.uglify          = require('gulp-uglify');


/*------------------------------------------------------------------------------
 * js Tasks
------------------------------------------------------------------------------*/
var jsBundle = function(bundler, folder) {
  return bundler.transform(babelify.configure({ presets: ['react', 'es2015'], ignore: ['node_modules'], sourceMaps: true })).bundle()
    .on('error', function (err) {
      console.log(err.toString());
      this.emit('end');
    })
    .pipe(source('bundle_' + folder + '.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.destDir + 'js'));
};

gulp.task('js:browserify', function() {
  var folders = functions.getFolders(paths.srcJs);
  var tasks = folders.map(function(folder) {
    var bundler = browserify({
      entries: [path.join(paths.srcJs, folder, '/app.js')],
      debug: true,
      cache: {},
      packageCache: {}
    });
    return jsBundle(bundler, folder);
  });
  return merge(tasks);
});

gulp.task('js:watchify', function() {
  var folders = functions.getFolders(paths.srcJs);
  var tasks = folders.map(function(folder) {
    var bundler = browserify({
      entries: [path.join(paths.srcJs, folder, '/app.js')],
      debug: true,
      cache: {},
      packageCache: {},
      plugin: [watchify]
    });
    bundler.on('update', function() { jsBundle(bundler, folder); });
    bundler.on('log', function(message) { console.log(message); });
    return jsBundle(bundler, folder);
  });
  return merge(tasks);
});
