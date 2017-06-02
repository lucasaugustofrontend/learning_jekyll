const gulp = require('gulp')
const sass = require('gulp-sass')
const prefixer = require('gulp-autoprefixer')
const minifycss = require('gulp-minify-css')
const jshint = require('gulp-jshint')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const clean = require('gulp-clean')
const concat = require('gulp-concat')
const notify = require('gulp-notify')
const cache = require('gulp-cache')
const plumber = require('gulp-plumber')
const browserSync = require('browser-sync')
const critical = require('critical')
const cp = require('child_process')

gulp.task('css', () => {
  return sass('assets/css/main.scss', {style: 'expanded'})
    .pipe(plumber())
    .pipe(prefixer('last 15 versions', '> 1%', 'ie 9', 'ie 8', 'ie 7'))
    .pipe(gulp.dest('css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('_site/assets/css'))
    .pipe(browserSync.reload({stream: true}))
    .pipe(notify({message: 'Style task complete'}))
})

gulp.task('js', () => {
  return gulp.src('assets/javascripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('js'))
    .pipe(gulp.dest('assets/javascripts'))
    .pipe(notify({message: 'Scripts task complete'}))
})

gulp.task('clean', () => {
  return gulp.src(['css', 'js'], {read: false})
    .pipe(clean())
})

gulp.task('critical-css', () => {
  critical.generate({
    // Your base directory
    base: '_site/',
    // HTML source file
    src: 'index.html',
    // CSS output file
    dest: 'css/critical.min.css',
    // Viewport widthy
    width: 1200,
    // Viewport height
    height: 900,
    // Minify critical-path CSS
    minify: true
  })
})

/**
 * Build Jekyll Site
*/
gulp.task('jekyll-build', (done) => {
  browserSync.notify('Building Jekyll')
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done)
})

/**
 * Rebuild jekyll  & do page reload
*/
gulp.task('jekyll-rebuild', ['jekyll-build'], () => {
  browserSync.reload()
})

/**
 * Wait for jekyll-build, then launch the Server
*/
gulp.task('server', ['jekyll-build'], () => {
  browserSync({
    server: {
      baseDir: '_site'
    },
    host: 'localhost'
  })
})

gulp.task('watch', () => {
  // Watch .scss files
  gulp.watch(['assets/css/main.scss', '_sass/**/*.scss'], ['css'])
  // Watch .js files
  gulp.watch('assets/javascripts/**/*.js', ['js'])
  // Watch .html files and posts
  gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '*.md', '_posts/*', '!node_modules/**/*'], ['jekyll-rebuild'])
})

gulp.task('default', ['clean'], () => {
  gulp.start('css', 'js', 'server', 'watch')
})