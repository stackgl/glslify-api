var CodeMirror = require('codemirror')
var debounce   = require('debounce')

var getShader  = require('../')('http://localhost:9005/', {
  ttl: 120000
})

var shader = [
    '#pragma glslify: dither = require(glsl-dither)'
  , 'void main() {'
  , '  gl_FragColor = vec4(1.0);'
  , '}'
].join('\n')

var editor = CodeMirror(document.querySelector('#left'), { value: shader })
var preview = CodeMirror(document.querySelector('#right'), { value: '', readOnly: true })

editor.on('change', debounce(update, 50))

preview.setSize(null, '100%')

update()
function update() {
  getShader(editor.getValue(), function(err, result) {
    if (err) throw err
    preview.setValue(result = result.trim())
  })
}
