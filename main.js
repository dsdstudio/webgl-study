function initGL($canvasEl) {
    var gl, keys = 'webgl,experimental-webgl,webkit-3d,moz-webgl'.split(','), i = keys.length;
    while (i--) if (gl = $canvasEl.getContext(keys[i])) break;
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
    for ( var i = 0, n = arguments.length; i<n; i++ ) gl.attachShader(program, arguments[i]);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw ( 'program link error : ' + gl.getShaderInfoLog(program));
    return program;
}

var gl = initGL(document.getElementById('glcanvas'));
var triangleData = [
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, 0.5, 0.0
];
var squareBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleData), gl.STATIC_DRAW);
squareBuffer.itemSize = 3;
squareBuffer.numItem = 4;
console.log(squareBuffer);

var vShader = createShader([
    'attribute vec3 aVertexPosition;',
    'uniform mat4 uPixelMatrix;',
    'uniform vec3 uPosition;',
    'uniform vec3 uRotation;',
    'uniform vec3 uScale;',
    'uniform vec3 uColor;',
    'varying vec3 vColor;',
    'mat4 rotationMTX(vec3 t) {',
    '  float s = sin(t[0]); float c = cos(t[0]);',
    '  mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);',
    '  mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);',
    '  mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);',
    '  return m1*m2*m3;',
    '}',
    'mat4 scaleMTX(vec3 t) {',
    '  return mat4(t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);',
    '}',
    'mat4 positionMTX(vec3 t) {',
    '  return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);',
    '}',
    'void main(void) {',
    '  gl_Position = uPixelMatrix * positionMTX(uPosition) * rotationMTX(uRotation) * scaleMTX(uScale) * vec4(aVertexPosition, 1.0);',
    '  vColor = uColor;',
    '}'
], 'vs');
var fShader = createShader([
    'precision mediump float;',
    'varying vec3 vColor;',
    'void main(void) {',
    '  gl_FragColor = vec4(vColor, 1.0);',
    '}'
], 'fs');
var program = createProgram(vShader, fShader);
program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
program.uRotation = gl.getUniformLocation(program, 'uRotation');
program.uColor = gl.getUniformLocation(program, 'uColor');
program.uPixelMatrix = gl.getUniformLocation(program, 'uPixelMatrix');
program.uScale = gl.getUniformLocation(program, 'uScale');
program.uPosition = gl.getUniformLocation(program, 'uPosition');


gl.viewport(0, 0, 500, 500);

var pixelMatrix = [
    2/500,0,0,0,
    0,2/500,0,0,
    0,0,0,0,
    0,0,0,1
];
var rotations = [0,0,0];
var scales = [100, 100, 1];
var position = [100, 100, 0];

function render() {
    //rotations[0] += 0.1;
    //rotations[1] += 0.1;
    rotations[2] += 0.01;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, squareBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // 변환 처리
    gl.uniform3fv(program.uRotation, rotations);
    // 픽셀 처리
    gl.uniformMatrix4fv(program.uPixelMatrix, false, pixelMatrix);
    // 스케일 처리
    gl.uniform3fv(program.uScale, scales);

    // 포지션 처리
    gl.uniform3fv(program.uPosition, position);

    // 색깔 쉐이더
    gl.uniform3fv(program.uColor, [Math.random(), Math.random(), Math.random()]);

    // 사각형이라서 요렇게
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareBuffer.numItem);
}
setInterval(render, 16);