var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var package = require('./package.json');
var shell = require('gulp-shell');

// The task that handles both development and deployment
var runBrowserifyTask = function (options) {

  // This bundle is for our application
  var bundler = browserify({
    debug: options.debug, // Need that sourcemapping
    standalone: 'flux-angular',
    // These options are just for Watchify
    cache: {}, packageCache: {}, fullPaths: options.debug
  })
    .require('./src/main.js', { entry: true })
    .external('angular');

  // The actual rebundle process
  var rebundle = function () {
    var start = Date.now();
    bundler.bundle()
      .on('error', gutil.log)
      .pipe(source(options.name))
      .pipe(gulpif(options.uglify, streamify(uglify())))
      .pipe(gulp.dest(options.dest))
      .pipe(notify(function () {

        // Fix for requirejs
        var fs = require('fs');
        var file = fs.readFileSync(options.dest + '/' + options.name).toString();
        file = file.replace('define([],e)', 'define(["angular"],e)');
        fs.writeFileSync(options.dest + '/' + options.name, file);

        console.log('Built in ' + (Date.now() - start) + 'ms');

      }));

  };

  // Fire up Watchify when developing
  if (options.watch) {
    bundler = watchify(bundler);
    bundler.on('update', rebundle);
  }

  return rebundle();

};

gulp.task('default', function () {

  runBrowserifyTask({
    watch: true,
    dest: './build',
    uglify: true,
    debug: false,
    name: 'flux-angular.js'
  });

});

gulp.task('test', shell.task([
    './node_modules/.bin/jasmine-node ./specs --autotest --watch ./src --color'
]));
