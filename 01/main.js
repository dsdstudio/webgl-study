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
/**
 * webgl 버퍼를 생성한다.
 * @param $arr 정점 데이터
 * @param $itemSize 데이터를 구성하는 구성요소 사이즈[x1,y1,z1, x2,y2,z2] -> 3 
 * @return WebGLBuffer{itemSize:$itemSize, numItem:$arr.length/$itemSize}
 * */
function createBuffer($arr, $itemSize) {
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array($arr), gl.STATIC_DRAW);
	buf.itemSize = $itemSize;
	buf.numItem = $arr.length / $itemSize;
	return buf;
}
var gl = initGL(document.getElementById('glcanvas'));

var vs = createShader(document.getElementById('shader-vs').text.split('\n'), 'vs');
var fs = createShader(document.getElementById('shader-fs').text.split('\n'), 'fs');
var program = createProgram(vs, fs);
program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
program.vertexColorAttribute = gl.getAttribLocation(program, 'aVertexColor');
gl.enableVertexAttribArray(program.vertexPositionAttribute);
gl.enableVertexAttribArray(program.vertexColorAttribute);
gl.useProgram(program);

//버퍼 만들기
var hexagonVertexBuffer = createBuffer([
	-0.3, 0.6, 0.0,
	-0.4, 0.8, 0.0,
	-0.6, 0.8, 0.0,
	-0.7, 0.6, 0.0,
	-0.6, 0.4, 0.0,
	-0.4, 0.4, 0.0,
	-0.3, 0.6, 0.0
], 3);

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disableVertexAttribArray(program.vertexColorAttribute);
	gl.vertexAttrib4f(program.vertexColorAttribute, 0.0, 0.0, 0.0, 1.0);

	gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, hexagonVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.LINE_STRIP, 0, hexagonVertexBuffer.numItem);
}
render();
