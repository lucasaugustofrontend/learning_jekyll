const gulp = require('gulp')
const bs = require('browser-sync').create()
const sass = require('gulp-sass')
const prefix = require('gulp-autoprefixer')
const cp = require('child_process')

const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll'
const messages = {
    jekyllBuild = '<span style="color: grey">Running:</span> $ jekyll build'
}

/*
  Build the Jekyll Site
*/
gulp.task('jekyll-build', (done) => {
    bs.notify(messages.jekyllBuild)
    return cp.spawn(jekyll, ['build'], { stdio: 'inherit' })
        .on('close', done)
})


/**
 * Rebuild Jekyll && do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], () => {
    bs.reload()
})

/**
 * Wait for jekyll-build, the lauch the Server
 */
gulp.task('server', ['sass', 'jekyll-build'], () => {
    bs.init({
        server: {
            baseDir: '_site'
        }
    })
})

/**
 * Compile from _scss into both _site/css (for live injection) and
 * (for future jekyll builds)
 */
gulp.task('sass', () => {
    return gulp.src('./assets/css/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: bs.notify
        }))
        .pipe(prefix['last 15 version', '> 1%', 'ie8', 'ie7'], { cascade: true })
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(bs.reload({ stream: true }))
})

/**
 * Watch scss file for changes & recompile
 * Watch html/md files, run jekyll& reload BrowserSync
 */
gulp.task('watch', () => {
    gulp.watch('_sass/**/*.scss', ['sass'])
    gulp.watch(['*.html', '_layouts/*.html', '_posts/*.*'], ['jekyll-rebuild'])
})

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */

gulp.task('default', ['server', 'watch'])