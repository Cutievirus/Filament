const gulp = require('gulp');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const minify = require('gulp-terser');
const stylus = require('gulp-stylus');
const gutil = require('gulp-util');
const merge = require('merge-stream');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');
const glob = require('glob');
const path = require('path');

function swallow(err){
    console.error(err.message);
    gutil.beep();
    this.emit('end');
}

const concatTask = (name,pattern,fun)=>gulp.task(name,()=>{
    let dirs = glob.sync(pattern);
    if(!dirs.length) return gulp.src([]);
    return merge(dirs.map(fun));
});
const concatDirectory=(dir)=> concat(dir.match(/[^\/]+(?=-concat)/)[0]);
const ignoreConcats = "!app/**/*-concat/**";

const stylusOptions = {
    compress:true
};

concatTask('stylus-concat',"app/**/*.styl{,us}-concat",dir=>
    gulp.src(dir+'/**/*.styl{,us}')
    .pipe(sourcemaps.init())
        .pipe(concatDirectory(dir))
        .pipe(stylus(stylusOptions))
        .on('error',swallow)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.dirname(dir)))
);

gulp.task('stylus',()=>
    gulp.src(["app/**/*.styl{,us}",ignoreConcats])
    .pipe(stylus(stylusOptions))
    .on('error',swallow)
    .pipe(gulp.dest('app'))
);

concatTask('js-concat',"app/**/*.js-concat",dir=>
    gulp.src(dir+'/**/*.js')
    .pipe(sourcemaps.init())
        .pipe(concatDirectory(dir))
        .pipe(minify())
        .on('error',swallow)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.dirname(dir)))
);

gulp.task('css',()=>
    gulp.src("app/**/*.css")
    .pipe(browserSync.stream())
);

gulp.task('browserSync',()=>{
    browserSync.init({
        server:{
            baseDir: 'app'
        }
    });
});

gulp.task('watch', ['stylus', 'stylus-concat', 'js-concat'], ()=>{
    gulp.watch(["app/**/*.styl{,us}",ignoreConcats],['stylus']);
    gulp.watch("app/**/*.styl{,us}-concat/**/*.styl{,us}",['stylus-concat']);
    gulp.watch("app/**/*.js-concat/**/*.js",['js-concat']);

    gulp.watch("app/**/*.html",browserSync.reload);
    gulp.watch("app/**/*.js",browserSync.reload);
    gulp.watch("app/**/*.css",['css']);
});

gulp.task('default',(done)=>{
    runSequence('watch','browserSync',done);
});

