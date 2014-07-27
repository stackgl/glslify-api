# glslify-api [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

An API and accompanying client for generating
[glslify](http://github.com/stackgl/glslify) shaders in the browser.

This is done by running glslify in the browser, but redirecting its functions
to read and resolve modules to a thin server. Files are cached locally
using [level.js](https://github.com/maxogden/level.js) to speed up the
bundling speed after the first run – it can even work offline after downloading
the required package once!

See the [example](http://github.com/stackgl/glslify-api/tree/master/example)
directory for a simple example.

[![NPM](https://nodei.co/npm/glslify-api.png)](https://nodei.co/npm/glslify-api/)

## Usage: Server

### `handle = api([cachedir])`

Returns an express-style route handler. `cachedir` is the location to store
temporary packages (using [npm-file](http://github.com/hughsk/npm-file)),
and defaults to `.glslify`.

### `handle(req, res, next)`

Given a request and response pair, handle a route. Will call `next` if there
is an error or a appropriate route is not found.

## Usage: Browser

### `getShader = api(serverURI, [options])`

Returns a function for compiling shaders within the browser. `serverURI`
should be the URI where you're hosting your copy of the `glslify-api` server –
if you don't pass one in that's OK too, there's one being hosted at
[glslify.shader.club](http://glslify.shader.club/).

Available options:

* `ttl`: the maximum amount of time to cache a file locally, in milliseconds.

### `getShader(source, done(err, result))`

Pass in a shader body `source`, and `done` will be called with either an error
or the glslified shader when ready.

## HTTP API

### `GET /`

Should return:

``` json
{
  "glslify": true
}
```

### `POST /-/shader`

Pipe a whole shader to the request body and get a glslified shader in
return. This is a little more blunt than the approach in the client, but
can be useful for small, quick experiments.

### `GET /:package/:file...`

Returns the raw contents of `file` from the `package` package on npm.

## License

MIT. See [LICENSE.md](http://github.com/stackgl/glslify-api/blob/master/LICENSE.md) for details.
