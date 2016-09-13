let canvas = document.getElementById('glcanvas');
const gl = BGL.initGL(canvas);
const vshader = BGL.createShader(
    `attribute vec3 aVertexPosition;
    attribute vec4 aVertexColor;
    varying vec4 vColor;
   
    void main(void) {
        vColor = aVertexColor;
        gl_Position = vec4(aVertexPosition, 1.0);
        // 포인트 스프라이트, 최소 1이상이여한다, gl_PointSize 는 예약어
        gl_PointSize = 5.0;
    }
    `,'vs');
const fshader = BGL.createShader(
    `precision mediump float;
    varying vec4 vColor;
    
    void main(void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    `,'fs');
const program = BGL.createProgram(vshader, fshader);

program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
program.aVertexColor = gl.getAttribLocation(program, 'aVertexColor');

const vertexBuffer = BGL.createBuffer([
    0.0, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
], 3);


gl.viewport(0,0,500,500);

render();

function render() {
    gl.clearColor(-1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, vertexBuffer.itemSize);
}
