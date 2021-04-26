'use strict';

// Paths to source files (src), to ready files (build), as wel as to those whose changes need to be monitored (watch)
var path = {
    build: {
        html: 'assets/build/',
        js: 'assets/build/js/',
        css: 'assets/build/css/',
        img: 'assets/build/img/',
        fonts: 'assets/build/fonts/',
    },
    src: {
        html: 'assets/src/*.html',
        js: 'assets/src/js/main.js',
        style: 'assets/src/style/main.scss',
        img: 'assets/src/img/**/*',
        fonts: 'assets/src/fonts/**/*.*',
    },
    watch: {
        html: 'assets/src/**/*.html',
        js: 'assets/src/js/**/*.js',
        css: 'assets/src/style/**/*.scss',
        img: 'assets/src/img/**/*.*',
        fonts: 'assets/src/fonts/**/*.*'
    },
    clean: './assets/build/*'
}

// Server settings
var config = {
    server: {baseDir: './assets/build'}, notify: false
};

// Include Gulp and Plugins
var gulp = require('gulp'),
    webserver = require('browser-sync'),
    plumber = require('gulp-plumber'),
    include = require('gulp-include'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-dart-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    jpegrecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    rename = require('gulp-rename'),
    googleWebFonts = require('gulp-google-webfonts');

// Google Fonts
gulp.task('download:font:google', () => {
    return gulp.src(path.src.fonts)
        .pipe(googleWebFonts())
        .pipe(gulp.dest(path.build.fonts));
});

// Start the server
gulp.task('webserver', function () {
    webserver(config);
});

// Complie HTML
gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(include())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({ stream: true }));
});

// Complie CSS
gulp.task('css:build', function () {
    return gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        //.pipe(gulp.dest(path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS())
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({ stream: true }));
});

// Complie Js
gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(include())
        //.pipe(gulp.dest(path.build.js))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({ stream: true }));
});

// Move fonts
gulp.task('fonts:build', function () {
    //return gulp.src(path.src.fonts)
    return  gulp.src([
        './node_modules/bootstrap-icons/font/fonts/*',
    ])
        .pipe(gulp.dest(path.build.fonts));
});

// Image processing
gulp.task('images:build', function (){
    return gulp.src(path.src.img)
        .pipe(cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({ progressive: true, max: 90, min: 80 }),
            pngquant({quality: [0.5, 0.5]}),
            imagemin.svgo({ plugins: [{ removeViewBox: false }]})
        ])))
        .pipe(gulp.dest(path.build.img));
});

// Clean task
gulp.task('clean:build', function () {
    return del(path.clean);
});

// Clear cache
gulp.task('cache:clear', function () {
    cache.clearAll();
});

// build task
gulp.task('build', gulp.series('clean:build', gulp.parallel('html:build', 'css:build', 'js:build', 'fonts:build', 'download:font:google', 'images:build')));

// Launching tasks and watch file path for change
gulp.task('watch', function() {
    gulp.watch(path.watch.html, gulp.series('html:build'));
    gulp.watch(path.watch.css, gulp.series('css:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('images:build'));
    gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
});

// Default tasks
gulp.task('default', gulp.series('build', gulp.parallel('webserver', 'watch')));