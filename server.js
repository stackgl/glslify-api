var resolver    = require('glslify-resolve-remote')
var combine     = require('stream-combiner')
var glslify     = require('glslify-stream')
var deparse     = require('glsl-deparser')
var glslResolve = require('glsl-resolve')
var npmfile     = require('npm-file')
var course      = require('course')
var path        = require('path')
var url         = require('url')
var fs          = require('fs')

module.exports = createServer

function createServer(cachedir) {
  cachedir = path.resolve(cachedir || path.join(process.cwd(), '.glslify'))

  var npmget   = npmfile(cachedir, glslResolve)
  var resolve  = resolver(cachedir)
  var router   = course()
  var pipeopts = {
      resolve: resolve
    , input: true
  }

  router.any('/'
    , statusCode(200)
    , jsonData
    , function(req, res) {
      res.statusCode = 200
      res.end({ glslify: true })
    })

  router.post('/-/shader'
    , statusCode(200)
    , bundleShader
  )

  router.get(/./
    , statusCode(200)
    , fromNpm
  )

  return router

  function bundleShader(req, res, next) {
    res.setHeader('content-type', 'text/plain')

    combine(
        req
      , glslify('/', pipeopts)
      , deparse()
      , res
    ).once('error', next)
  }

  function fromNpm(req, res, next) {
    var parts = url.parse(req.url)
      .pathname
      .split(/\/+/g)
      .filter(Boolean)

    var name = parts.shift()
    var file = parts.join('/')

    npmget(name, 'latest', file, function(err, path) {
      if (err) return next(err)

      res.setHeader('Cache-Control', 'public, max-age=31536')
      fs.createReadStream(path)
        .pipe(res)
    })
  }
}

function jsonData(req, res, next) {
  var end = res.end

  res.setHeader('content-type', 'application/json')
  res.end = function() {
    if (arguments[0]) {
      arguments[0] = JSON.stringify(arguments[0])
    }

    return end.apply(this, arguments)
  }

  return next()
}

function statusCode(code) {
  return function(req, res, next) {
    res.statusCode = code
    return next()
  }
}
