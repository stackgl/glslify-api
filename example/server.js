var api        = require('../')(__dirname + '/.cache')
var browserify = require('browserify')
var http       = require('http')
var fs         = require('fs')

http.createServer(function(req, res) {
  // index.html
  if (req.url === '/') {
    res.setHeader('content-type', 'text/html')

    return fs
      .createReadStream(__dirname + '/index.html')
      .pipe(res)
  }

  // browserify bundle
  if (req.url === '/bundle.js') {
    res.setHeader('content-type', 'application/javascript')

    return browserify(__dirname + '/client.js')
      .bundle()
      .pipe(res)
  }

  // API routes
  api(req, res, function(err) {
    if (err) {
      res.statusCode = 500
      res.end([err.message, err.stack].join('\n'))
    } else {
      res.statusCode = 404
      res.end('404')
    }
  })
}).listen(9005, function(err) {
  if (err) throw err
  console.log('http://localhost:9005')
})
