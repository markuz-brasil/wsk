'use strict'

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var assign = require('object-assign')

var EE = new require('events').EventEmitter

var watch = require('./tasks/watchers');
var CFG = require('./tasks/config');

var log = $.util.log
var red = $.util.colors.red
var cyan = $.util.colors.cyan
var mag = $.util.colors.magenta

var evt = new EE()

module.exports = function wsk (userGulp, userCfg) {
  assign(userGulp || {}, gulp)
  assign(CFG, userCfg || {})
}

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) { console.error(err) }

var BS
var SERVE = false

// Clean Output Directory
gulp.task('clean', del.bind(null, [CFG.dev, CFG.build], {force: true}));

// TODO: add comments
gulp.task('default', ['build'])

// TODO: add comments
gulp.task('dev', function(next){
  runSequence('clean', 'assets', 'reload', next)
})

// TODO: add comments
gulp.task('build', function(next){
  runSequence('dev', ['jshint', 'images', 'copy', 'styles', 'html', 'inline'], 'reload', next)
})

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(CFG.es6.src)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
});

// TODO: add comments
gulp.task('serve', function (next) {
  SERVE = true
  CFG.browserSync.browser = CFG.browserSync.browser || 'skip'
  evt.on('done', function () {
    browserSync(CFG.browserSync, function(err, bs){
      if (err) {throw err}
      BS = bs
      log("Loaded '"+ cyan('browserSync') +"'...")
      next()
    });
  })
});

// TODO: add comments
var skipReload = true
gulp.task('reload', function(next){
  if (!SERVE) return next()

  if (process.argv.indexOf('build') > -1 && skipReload) {
    skipReload = false
    return next()
  }

  if (!BS) {
    next()
    return evt.emit('done')
  }

  setTimeout(function () {
    browserSync.reload()
    BS.logger.info('Local URL: '+ mag(BS.options.urls.local))
    BS.logger.info('External URL: '+ mag(BS.options.urls.external))
    next()
  }, 100)

});

// TODO: add comments
gulp.task('restart', function(){
  log(red(':: restarting ::'))
  process.exit(0)
})

// // TODO: add comments
gulp.task('watch', function(next){
  watch.gulpfile()

  if (process.argv.indexOf('build') > -1) {
    watch.optmize()
  }
  else {
    watch.assets()
  }

  next()
})
