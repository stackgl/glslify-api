var combine = require('stream-combiner')
var glslify = require('glslify-stream')
var deparse = require('glsl-deparser')
var concat  = require('concat-stream')
var leveljs = require('level-js')
var levelup = require('levelup')
var from    = require('new-from')
var through = require('through')
var xhr     = require('xhr')
var url     = require('url')

module.exports = createClient

function createClient(host, opts) {
  var db = levelup('glslify-api', {
      valueEncoding: 'json'
    , db: leveljs
  })

  opts = opts || {}
  opts.ttl = opts.ttl || 600000

  return function createShader(shader, done) {
    combine(
        from([shader])
      , glslify('/', {
          input: true
        , resolve: resolve
        , read: read
      })
      , deparse()
      , concat(function(data) {
        done(null, data)
      })
    ).once('error', done)
  }

  function resolve(src, dst, found) {
    if (dst.charAt(0) === '.') {
      return found(null, url.resolve(src, dst))
    }

    var dstfile = dst.split('/')
    var dstname = dstfile.shift()

    return found(null, '/' + dstname + '/' + dstfile.join('/'))
  }

  function read(filename) {
    var stream = through()
    var src    = url.resolve(host, filename)

    db.get(filename, function(err, data) {
      var now = +new Date

      if (data) {
        stream.queue(data.data)
        stream.queue(null)

        return now - data.timestamp > opts.ttl
            && db.del(filename)
      }

      xhr(src, function(err, res, body) {
        if (err) return stream.emit('error', err)

        stream.queue(body)
        stream.queue(null)

        db.put(filename, {
            timestamp: now
          , data: body
        })
      })
    })

    return stream.once('end', function() {
      stream.emit('close')
    })
  }
}
