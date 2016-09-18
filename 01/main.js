var gl = BGL.initGL(document.getElementById('glcanvas'));
var vs = BGL.createShader(document.getElementById('shader-vs').text, 'vs');
var fs = BGL.createShader(document.getElementById('shader-fs').text, 'fs');
var program = BGL.createProgram(vs, fs);
program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
program.vertexColorAttribute = gl.getAttribLocation(program, 'aVertexColor');
gl.enableVertexAttribArray(program.vertexPositionAttribute);
gl.enableVertexAttribArray(program.vertexColorAttribute);
gl.useProgram(program);

//버퍼 만들기
var hexagonVBO = BGL.createBuffer([
	-0.3, 0.6, 0.0,
	-0.4, 0.8, 0.0,
	-0.6, 0.8, 0.0,
	-0.7, 0.6, 0.0,
	-0.6, 0.4, 0.0,
	-0.4, 0.4, 0.0,
	-0.3, 0.6, 0.0
], 3);
var triangleVBO = BGL.createBuffer([
	0.3, 0.4, 0.0,
	0.7, 0.4, 0.0,
	0.5, 0.8, 0.0
], 3);
var triangleCBO = BGL.createBuffer([
	1.0, 0.0, 0.0, 1.0,
	0.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 1.0
], 4);
var stripVBO = BGL.createBuffer([
	-0.5, 0.2, 0.0,
	-0.4, 0.0, 0.0,
	-0.3, 0.2, 0.0,
	-0.2, 0.0, 0.0,
	-0.1, 0.2, 0.0,

	0.0, 0.0, 0.0,
	0.1, 0.2, 0.0,
	0.2, 0.0, 0.0,
	0.3, 0.2, 0.0,
	0.4, 0.0, 0.0,
	0.5, 0.2, 0.0,

	-0.5, -0.3, 0.0,
	-0.4, -0.5, 0.0,
	-0.3, -0.3, 0.0,
	-0.2, -0.5, 0.0,
	-0.1, -0.3, 0.0,

	0.0, -0.5, 0.0,
	0.1, -0.3, 0.0, 
	0.2, -0.5, 0.0,
	0.3, -0.3, 0.0,
	0.4, -0.5, 0.0,
	0.5, -0.3, 0.0
], 3);
var stripIBO = BGL.createElementBuffer([0,1,2,3,4,5,6,7,8,9,10,10,10,11,11,12,13,14,15,16,17,18,19,20,21]);

function draw(){
	gl.clear(gl.COLOR_BUFFER_BIT);

	// 육각형
	gl.disableVertexAttribArray(program.vertexColorAttribute);
	gl.vertexAttrib4f(program.vertexColorAttribute, 0.0, 0.0, 0.0, 1.0);

	gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVBO);
	gl.vertexAttribPointer(program.vertexPositionAttribute, hexagonVBO.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINE_STRIP, 0, hexagonVBO.numItem);

	// 삼각형 
	gl.enableVertexAttribArray(program.vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVBO);
	gl.vertexAttribPointer(program.vertexPositionAttribute, triangleVBO.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleCBO);
	gl.vertexAttribPointer(program.vertexColorAttribute, triangleCBO.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, triangleVBO.numItem);

	// STRIP
	gl.disableVertexAttribArray(program.vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, stripVBO);
	gl.vertexAttribPointer(program.vertexPositionAttribute, stripVBO.itemSize, gl.FLOAT, false, 0, 0);

	// 색깔대신 상수값 바인딩
	gl.vertexAttrib4f(program.vertexColorAttribute, 1.0, 1.0, 0.0, 1.0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripIBO);

	gl.drawElements(gl.TRIANGLE_STRIP, stripIBO.numItem, gl.UNSIGNED_SHORT, 0);
	gl.vertexAttrib4f(program.vertexColorAttribute, 0.0, 0.0, 0.0, 1.0);

    // guide line 그리기
	gl.drawArrays(gl.LINE_STRIP, 0, 11);
	gl.drawArrays(gl.LINE_STRIP, 11, 11);
}
function render() {
	gl.frontFace(gl.CCW);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	draw();
}
render();
