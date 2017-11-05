var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    jshintStylish = require('jshint-stylish'),
    complexity = require('gulp-complexity'),
    rimraf = require('rimraf');

gulp.task('complexity', function () {
    return gulp.src('lib/**/*.js')
        .pipe(complexity({
            cyclomatic: [ 5 ],
            halstead: [ 16 ],
            maintainability: [ 100 ]
        }));
});

gulp.task('lint', function () {
    gulp.src([ 'gulpfile.js', 'lib/**/*.js' ])
        .pipe(jshint({ esnext: true }))
        .pipe(jshint.reporter(jshintStylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('test', function () {
    return gulp.src('test/**/*')
        .pipe(mocha());
});

gulp.task('compile', function () {
    gulp.src('lib/**/*.json')
        .pipe(gulp.dest('./dist'));
});


gulp.task('default', [ 'lint', 'test', 'compile' ]);
