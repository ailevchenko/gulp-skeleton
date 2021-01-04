'use strict';

const {
    src,
    dest
} = require("gulp");

const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const cssnano = require("gulp-cssnano");
const rigger = require("gulp-rigger");
const uglify = require("gulp-uglify-es").default;
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const del = require("del");
const panini = require("panini");
const browsersync = require("browser-sync").create();


let path = {
    // пути для файлов после сборки.
    build: {
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        images: 'dist/assets/img/'
    },
    // пути где искать исходники.
    src: {
        html: 'src/html/views/*.html',
        js: 'src/js/*.js',
        css: 'src/scss/style.scss',
        images: 'src/img/**/*.{jpg,png,svg,gif}'
    },
    // файлы за которыми наблюдаем.
    watch: {
        html: 'src/html/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/scss/**/*.scss',
        images: 'src/img/**/*.{jpg,png,svg,gif}'
    },
    // очищаем папку.
    clean: './dist'
}

function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 3200
    });
}

function browserSyncReload(done) {
    browsersync.reload();
}

function html() {
    panini.refresh();
    return src(path.src.html, {
            base: './src/html/views'
        }) // берем исходники html.
        .pipe(plumber())
        .pipe(panini({
            root: './src/html',
            layouts: './src/html/templates/layouts',
            partials: './src/html/blocks',
            helpers: './src/html/templates/helpers',
            data: './src/html/templates/data'
        }))
        .pipe(dest(path.build.html)) // складываем html в билд.
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css, {
            base: './src/scss/'
        }) // берем исходники scss.
        .pipe(plumber())
        .pipe(sass()) // компиляция scss - css
        .pipe(autoprefixer({ // проставить префиксы
            Browserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css)) // складываем в билд.
        .pipe(cssnano({ // минимизируем файл
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments()) // удаляем коментарии из файла
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js, {base: './src/js'})
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min',
        extname: '.js'
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
    return src(path.src.images, {base: './src/img'})
        .pipe(imagemin())
        .pipe(dest(path.build.images));
}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images)); 
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
