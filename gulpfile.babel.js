'use strict';

import gulp from 'gulp';

import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import cache from 'gulp-cache';
import changed from 'gulp-changed';
import cssnano from 'gulp-cssnano';
import del from 'del';
import gulpIf from 'gulp-if';
import imagemin from 'gulp-imagemin';
import runSequence from 'run-sequence';
import rsync from 'gulp-rsync';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';
import useref from 'gulp-useref';


const filesToMove = [
  'app/favicon.png',
  'app/js/vendor/*',
  'app/css/**/*'
];

const reload = browserSync.reload;

gulp.task('sass', () => {
  return gulp
    .src('app/scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'nested'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('watch', ['browserSync', 'sass'], () => {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('useref', () => {
  return gulp
    .src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
});

gulp.task('images', () => {
  return gulp
    .src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('move', () => {
  return gulp
    .src(filesToMove, {base: 'app'})
    .pipe(gulp.dest('dist'))
});

gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});

gulp.task('default', (callback) => {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
});

gulp.task('clean:dist', () => {
  return del.sync('dist');
});

gulp.task('build', (callback) => {
  runSequence('clean:dist', ['sass', 'useref', 'move', 'images'],
    callback
  )
});
