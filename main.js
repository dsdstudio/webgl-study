const gl = BGL.initGL(document.getElementById('glcanvas'));
const squareBuffer = BGL.createBuffer([
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    -0.5, 0.5, 0.0,
    0.5, 0.5, 0.0
], 3);
const uvBuffer = BGL.createBuffer([
	0.0, 0.0,
	1.0, 0.0,
	0.0, 1.0,
	1.0, 1.0
], 2);
const vShader = BGL.createShader(
`attribute vec3 aVertexPosition;
attribute vec2 aVertexUV;
uniform mat4 uPixelMatrix;
varying vec2 vUV;
uniform vec3 uPosition;
uniform vec3 uRotation;
uniform vec3 uScale;
uniform vec3 uColor;
varying vec3 vColor;
mat4 rotationMTX(vec3 t) {
  float s = sin(t[0]); float c = cos(t[0]);
  mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);
  mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);
  mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);
  return m1*m2*m3;
}
mat4 scaleMTX(vec3 t) {
  return mat4(t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);
}
mat4 positionMTX(vec3 t) {
  return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);
}
void main(void) {
  vUV = aVertexUV;
  gl_Position = uPixelMatrix * positionMTX(uPosition) * rotationMTX(uRotation) * scaleMTX(uScale) * vec4(aVertexPosition, 1.0);
  vColor = uColor;
}`, 'vs');
var fShader = BGL.createShader(
`precision mediump float;
uniform sampler2D uSampler;
varying vec2 vUV;
varying vec3 vColor;
void main(void) {
  gl_FragColor = texture2D(uSampler, vec2(vUV.s, vUV.t));
  /*
  gl_FragColor.r *= vColor[0];
  gl_FragColor.g *= vColor[1];
  gl_FragColor.b *= vColor[2];
  */
}`, 'fs');
const program = BGL.createProgram(vShader, fShader);
program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
program.aVertexUV = gl.getAttribLocation(program, 'aVertexUV');
program.uSampler = gl.getUniformLocation(program, 'uSampler');
program.uRotation = gl.getUniformLocation(program, 'uRotation');
program.uColor = gl.getUniformLocation(program, 'uColor');
program.uPixelMatrix = gl.getUniformLocation(program, 'uPixelMatrix');
program.uScale = gl.getUniformLocation(program, 'uScale');
program.uPosition = gl.getUniformLocation(program, 'uPosition');

gl.viewport(0, 0, 500, 500);

const firstTexture = gl.createTexture();
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
const pixelMatrix = [
    2/500,0,0,0,
    0,2/500,0,0,
    0,0,0,0,
    0,0,0,2
];
const rotations = [0, 0, 0];
const scales = [300, 300, 1];
const position = [0, 0, 0];

function rand(min, max) { return Math.floor(min + (Math.random() * (max - min))); }
function render() {
    gl.clearColor(-1, 0, 0, 1);
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

const sliderx = document.getElementById('slider-x'),
    slidery = document.getElementById('slider-y'),
    sliderz = document.getElementById('slider-z');
sliderz.oninput = function(e) { position[2] = +e.target.value; }
slidery.oninput = function(e) { position[1] = +e.target.value; }
sliderx.oninput = function(e) { position[0] = +e.target.value; }

const scalex = document.getElementById('scale-x'),
    scaley = document.getElementById('scale-y');

scalex.oninput = function(e) { scales[0] = +e.target.value; }
scaley.oninput = function(e) { scales[1] = +e.target.value; }

const rotatex = document.getElementById('rotate-x'),
	rotatey = document.getElementById('rotate-y'),
	rotatez = document.getElementById('rotate-z');
rotatex.oninput = function(e) { rotations[0] = +e.target.value; }
rotatey.oninput = function(e) { rotations[1] = +e.target.value; }
rotatez.oninput = function(e) { rotations[2] = +e.target.value; }
