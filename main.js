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
var squareBuffer = createBuffer([
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, 0.5, 0.0
], 3);
var uvBuffer = createBuffer([
	0.0, 0.0,
	1.0, 0.0,
	0.0, 1.0,
	1.0, 1.0
], 2);
var vShader = createShader([
    'attribute vec3 aVertexPosition;',
    'attribute vec2 aVertexUV;',
    'uniform mat4 uPixelMatrix;',
	'varying vec2 vUV;',
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
	'  vUV = aVertexUV;',
    '  gl_Position = uPixelMatrix * positionMTX(uPosition) * rotationMTX(uRotation) * scaleMTX(uScale) * vec4(aVertexPosition, 1.0);',
    '  vColor = uColor;',
    '}'
], 'vs');
var fShader = createShader([
    'precision mediump float;',
	'uniform sampler2D uSampler;',
    'varying vec2 vUV;',
    'varying vec3 vColor;',
    'void main(void) {',
	'  gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t));',
    /*'  gl_FragColor.r *= vColor[0];',
    '  gl_FragColor.g *= vColor[1];',
    '  gl_FragColor.b *= vColor[2];',*/
    '}'
], 'fs');
var program = createProgram(vShader, fShader);
program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
program.aVertexUV = gl.getAttribLocation(program, 'aVertexUV');
program.uSampler = gl.getUniformLocation(program, 'uSampler');
program.uRotation = gl.getUniformLocation(program, 'uRotation');
program.uColor = gl.getUniformLocation(program, 'uColor');
program.uPixelMatrix = gl.getUniformLocation(program, 'uPixelMatrix');
program.uScale = gl.getUniformLocation(program, 'uScale');
program.uPosition = gl.getUniformLocation(program, 'uPosition');

gl.viewport(0, 0, 500, 500);

var firstTexture = gl.createTexture();
firstTexture.img = new Image();
firstTexture.img.src = 'test.png';
firstTexture.img.onload = function() {
	gl.bindTexture(gl.TEXTURE_2D, firstTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, firstTexture.img); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
	setInterval(render, 16);
};
var pixelMatrix = [
    2/500,0,0,0,
    0,2/500,0,0,
    0,0,0,0,
    0,0,0,1
];
var rotations = [0,0,0];
var scales = [200, 200, 1];
var position = [0, 0, 0];

function render() {
//    rotations[0] += 0.01;
//   rotations[1] += 0.01;
    rotations[2] += 0.01;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, squareBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.enableVertexAttribArray(program.aVertexUV);
    gl.vertexAttribPointer(program.aVertexUV, uvBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// 텍스쳐
	gl.activeTexture(gl.TEXTURE0);
   	gl.bindTexture(gl.TEXTURE_2D, firstTexture);
   	gl.uniform1i(program.uSampler, 0);
		    
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
