var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish');

gulp.task('lint', function () {
    gulp.src([ 'gulpfile.js', 'lib/**/*.js' ])
        .pipe(jshint({ esnext: true }))
        .pipe(jshint.reporter(jshintStylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('default', [ 'lint' ]);
