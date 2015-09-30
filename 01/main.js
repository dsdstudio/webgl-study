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
