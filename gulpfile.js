'use strict';

var gulp = require('gulp');
var react = require('gulp-react');

var paths = {
  jsx: './src/**/*.jsx',
  js: './src/**/*.js',
  html: ['./src/**/*.html','./src/**/*.htm'],
  assets: ['./src/**/*.png', './src/**/*.css'],
  manifest: './src/manifest.json'
};

gulp.task('build:jsx', function () {
  return gulp.src(paths.jsx)
    .pipe(react())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build:js', function () {
  return gulp.src(paths.js)
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy:html', function () {
  return gulp.src(paths.html)
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy:assets', function () {
  return gulp.src(paths.assets)
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy:manifest', function () {
  return gulp.src(paths.manifest)
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy', ['copy:html', 'copy:assets', 'copy:manifest']);
gulp.task('build', ['build:jsx', 'build:js']);

gulp.task('watch', ['build', 'copy'], function () {
  gulp.watch(paths.jsx, ['build:jsx']);
  gulp.watch(paths.js, ['build:js']);
  gulp.watch(paths.html, ['copy:html']);
  gulp.watch(paths.assets, ['copy:assets']);
  gulp.watch(paths.manifest, ['copy:manifest']);
});

gulp.task('default', ['build', 'copy']);
