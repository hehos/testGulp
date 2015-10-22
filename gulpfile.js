var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
  	rename = require('gulp-rename'),
    minifycss = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    spritesmith = require('gulp.spritesmith'),
    csso = require('gulp-csso'),
    merge = require('merge-stream'),
    //pngquant = require('imagemin-pngquant'),  // 使用这个有问题
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    runSequence = require('run-sequence');


var pkg = require('./package.json');
var cf = {
    src: {
        file: {
            scss: 'scss/**/*.scss',
            commCss: 'css/*.css',
            js: 'js/**/*.js',
            img: ['!img/myicon/*.*', 'img/**/*'],
            sprite: 'img/myicon/*.png',
            font: 'font/*'
        },
        dir: {
            scss: 'scss/',
            css: 'css/',
            js: 'js/',
            img: 'img/',
            sprite: 'img/myicon/',
            font: 'font/'
        }
    },
    dist: {
        file: {
            css: 'dist/css/**/*.css'
        },
        dir: {
            js: 'dist/js',
            css: 'dist/css',
            img: 'dist/img',
            font: 'dist/font'
        }
    },
    autoprefixerBrowsers: [
        'Android 2.3',
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 8',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6'
    ],
    spritePrefix: '.myicon-'
};


// ===============================================
// style
// sass
gulp.task('sass', function () {
    return sass(cf.src.file.scss, { sourcemap: true })
        .on('error', sass.logError)
        .pipe(autoprefixer({
            browsers: cf.autoprefixerBrowsers,
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(sourcemaps.write('map', {
            includeContent: false,
            sourceRoot: 'scss'
        }))
        .pipe(gulp.dest(cf.src.dir.css));
});
// optimize css  优化样式
gulp.task('optimize', function () {
    return gulp.src(cf.src.file.commCss)
        .pipe(concat('all.js'))

        .pipe(minifycss({compatibility: 'ie8'}))
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(gulp.dest(cf.dist.dir.css));
});
// style
gulp.task('style', function() {
    runSequence('sass', 'optimize');
});

// ========================================================
// 图片
gulp.task('img', function () {
    return gulp.src(cf.src.file.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(cf.dist.dir.img));
});


// 生成雪碧图
gulp.task('sprite', function () {
    // Generate our spritesheet
    var spriteData = gulp.src(cf.src.file.sprite).pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css',
        cssOpts: {
            cssSelector: function (sprite) {
                return cf.spritePrefix + sprite.name;  // 自定义className前缀
            }
        }
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
        .pipe(imagemin())
        .pipe(gulp.dest(cf.dist.dir.img));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        //.pipe(csso())  // 压缩css
        .pipe(gulp.dest(cf.dist.dir.css));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
});

// 监听
gulp.task('watch', function() {

    // 监听所有.scss
    gulp.watch(config.src.scss, ['styles']);

    // 监听所有.js文件
    gulp.watch(config.src.js, ['scripts']);

    // 监听所有图片文件
    gulp.watch(config.src.img, ['images']);

    // 建立即时重整伺服器
    var server = livereload();

    // 监听所有位在 dist/  目录下的文件，一旦有更动，便进行更新
    gulp.watch(['dist/**']).on('change', function(file) {
        server.changed(file.path);
    });

});

// 清理
gulp.task('clean', function() {
    return gulp.src([config.dist.css, config.dist.js], {read: false})
        .pipe(clean());
});

// 预设任务
gulp.task('default', ['clean'], function() {
    runSequence('style');
});

//// 脚本
//gulp.task('scripts', function() {
//    return gulp.src(config.src.js)
//        .pipe(jshint('.jshintrc'))
//        .pipe(jshint.reporter('default'))
//        .pipe(concat(pkg.name + '.js'))
//        .pipe(gulp.dest(config.dist.js))
//        .pipe(rename({ suffix: '.min' }))
//        .pipe(uglify())
//        .pipe(gulp.dest(config.dist.js))
//        .pipe(notify({ message: 'Scripts task complete' }));
//});
//
//// 图片
//gulp.task('images', function() {
//    return gulp.src(config.src.img)
//        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
//        .pipe(gulp.dest(config.dist.img))
//        .pipe(notify({ message: 'Images task complete' }));
//});
//

// 监听
//gulp.task('watch', function() {
//
//    // 监听所有.scss
//    gulp.watch(config.src.scss, ['styles']);

    //// 监听所有.js文件
    //gulp.watch(config.src.js, ['scripts']);
    //
    //// 监听所有图片文件
    //gulp.watch(config.src.img, ['images']);
    //
    //// 建立即时重整伺服器
    //var server = livereload();
    //
    //// 监听所有位在 dist/  目录下的文件，一旦有更动，便进行更新
    //gulp.watch(['dist/**']).on('change', function(file) {
    //    server.changed(file.path);
    //});

//});