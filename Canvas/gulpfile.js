var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var $ = require('gulp-load-plugins')();

var jsFiles = [
  'canvas/js/app/app.js'
];

var css_destPath = 'canvas/css';
var js_destPath = 'canvas/js/dist';

gulp.task('sass', function () {
    return gulp.src('canvas/scss/styles.scss')
      .pipe($.sass({
          errLogToConsole: true
      })
        .on('error', $.sass.logError))
      .pipe($.autoprefixer({
          browsers: ['> 1%', 'last 2 versions', 'ie >= 9']
      }))
      .pipe(gulp.dest(css_destPath))
      .pipe(minifyCss({
          keepSpecialComments: 0
      }))
      .pipe($.rename({ extname: '.min.css' }))
      .pipe(gulp.dest(css_destPath));
});

gulp.task('js', function () {
    return gulp.src(jsFiles)
        .pipe($.concat('app.js'))
        .pipe(gulp.dest(js_destPath))
        .pipe($.rename({ extname: '.min.js' }))
        .pipe($.uglify())
        .pipe(gulp.dest(js_destPath));
});


gulp.task('default', ['sass', 'js']);

gulp.task('watch', function () {
    gulp.watch(['canvas/**/*.scss'], ['sass']);
    gulp.watch(jsFiles, ['js']);
});

