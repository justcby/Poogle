var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var config = require('./config/config');

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
  process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
  process.env.NODE_ENV = 'production';
});

// Nodemon task
gulp.task('nodemon', function () {
  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: ['--debug'],
    ext: 'js,html',
    verbose: true,
    watch: config.assets.server.allJS
  });
});

// Nodemon task without verbosity or debugging
gulp.task('nodemon-nodebug', function () {
  return plugins.nodemon({
    script: 'server.js'
  });
});

// Run the project in development mode
gulp.task('default', function (done) {
  runSequence('env:dev','nodemon', done);
});

// Run the project in production mode
gulp.task('prod', function (done) {
  runSequence('env:prod','nodemon-nodebug', done);
});