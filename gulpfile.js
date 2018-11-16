const gulp = require('gulp');
const concat = require('gulp-concat-sourcemap');
const replace = require('gulp-replace');
const minify = require('gulp-terser');
const glob = require('glob');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');

const concats = glob.sync("app/**/*-concat");
const scriptloaders = [];
concats.forEach(dir=>{
    let name = dir.match(/[^\/]+(?=-concat)/)[0];
    let dest = dir.match(/.+(?=\/)/)[0];
    gulp.task(dir,()=>
        gulp.src(dir+'/*')
        .pipe(concat(name))
        //.pipe(minify())
        //.pipe(scriptloader('app/',name))
        .pipe(gulp.dest(dest))
    );
});

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

gulp.task('watch', [...concats],()=>{
    for (let dir of concats){
        gulp.watch(dir+'/*',[dir]);
    }
    gulp.watch("app/**/*.html",browserSync.reload);
    gulp.watch("app/**/*.js",browserSync.reload);
    gulp.watch("app/**/*.css",['css']);
});

gulp.task('default',(done)=>{
    runSequence('watch','browserSync',done);
});


let minifiedScripts = glob.sync("app/**/*.min.js");

gulp.task('clean',()=>del('dist/'));

gulp.task('copy',()=>{
    let exclusions = [];
    for (let path of minifiedScripts){
        exclusions.push("!"+path.replace(".min.js",".js"));
    }
    return gulp.src(["app/**/*"
        ,"!app/**/*-concat{,/**}"
        ,...exclusions
    ])
    .pipe(gulp.dest("dist/"));
});

gulp.task('build-html',()=>{
    let stream =  gulp.src("dist/index.html");
    for (let path of minifiedScripts){
        path=path.replace("app/","");
        stream=stream.pipe(replace(path.replace(".min.js",".js"),path));
    }
    return stream.pipe(gulp.dest("dist/"));
});

gulp.task('build',(done)=>{
    runSequence(concats,'clean','copy','build-html',scriptloaders,done);
});
