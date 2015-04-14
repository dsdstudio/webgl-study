function initGL($canvasEl) {
    var gl, keys = 'webgl,experimental-webgl,webkit-3d,moz-webgl'.split(','), i = keys.length;
    while (i--) if (gl = $canvasEl.getContext(keys[i])) break
    if (gl) console.log('webgl 초기화 성공!');
    else console.log('webgl 초기화 실패!');
    return gl;
}

function createShader($shaderStrArr, $type) {
    var shader, shaderTypeMap;
    shaderTypeMap = { 'vs':gl.VERTEX_SHADER,'fs':gl.FRAGMENT_SHADER };

    shader = gl.createShader(shaderTypeMap[$type]);
    gl.shaderSource(shader, $shaderStrArr.join('\n'));
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) throw ( 'shader compile error : ' + gl.getShaderInfoLog(shader));
    return shader;
}
function createProgram() {
    var program = gl.createProgram();
    for ( var i = 0, n = arguments.length; i<n; i++)
        gl.attachShader(program, arguments[i]);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw ( 'program link error : ' + gl.getShaderInfoLog(program));
    return program;
}

var gl = initGL(document.getElementById('glcanvas'));
var triangleData = [
    0.0, .5, 0.0,
    -.5, -.5, 0.0,
    .5, -.5, 0.0
];
var triangleBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleData), gl.STATIC_DRAW);
triangleBuffer.itemSize = 3;
triangleBuffer.numItem = 3;
console.log(triangleBuffer);

var vShader = createShader([
    'attribute vec3 aVertexPosition;',
    'void main(void) {',
    '  gl_Position = vec4(aVertexPosition, 1.0);',
    '}'
], 'vs');
var fShader = createShader([
    'void main(void) {',
    '  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
    '}'
], 'fs');
var program = createProgram(vShader, fShader);
program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');

function render() {
    gl.clearColor(Math.random(), Math.random(), Math.random(), 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, triangleBuffer.numItem);
}
gl.viewport(0, 0, 500, 500);
setInterval(render, 16);