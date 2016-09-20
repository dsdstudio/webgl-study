const gl = BGL.initGL(document.getElementById('glcanvas'));

const cubeVBO = BGL.createBuffer([
    // 전면 
    0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,

    //후면 
    0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,

    // 좌측면
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,

    // 우측면
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,

    //상단면
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,

    // 하단면
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5
], 3);
const cubeIBO = BGL.createElementBuffer([
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 22, 21, 20, 23, 22
]);

const cubeColorVBO = BGL.createBuffer([
    0.5, 0.5, 0.5, 0.5,
    0.5, 0.0, 0.0, 0.5,
    0.0, 0.5, 0.0, 0.5,
    0.0, 0.0, 0.5, 0.5,
    0.5, 0.5, 0.0, 0.5,
    0.5, 0.0, 0.5, 0.5
], 4);

const vshader = BGL.createShader(`
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;                                 

uniform mat4 uPixelMatrix;
uniform vec3 uPosition;
uniform vec3 uRotation;
uniform vec3 uScale;

varying lowp vec4 vColor;

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
  return mat4(1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);
}
void main(void) {
  gl_Position = uPixelMatrix * positionMTX(uPosition) * rotationMTX(uRotation) * scaleMTX(uScale) * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
}`, 'vs');
const fshader = BGL.createShader(`
    varying lowp vec4 vColor;
    
    void main(void) {
        gl_FragColor = vColor;
    }
`,'fs');

const program = BGL.createProgram(vshader, fshader);
program.uPixelMatrix = gl.getUniformLocation(program, 'uPixelMatrix');
program.uRotation = gl.getUniformLocation(program, 'uRotation');
program.uScale = gl.getUniformLocation(program, 'uScale');
program.uPosition = gl.getUniformLocation(program, 'uPosition');
program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
program.aVertexColor = gl.getUniformLocation(program, 'aVertexColor');

gl.viewport(0, 0, 500, 500);

const pixelMatrix = [
    2/500,0,0,0,
    0,2/500,0,0,
    0,0,0,0,
    0,0,0,2
];
const rotations = [0, 0, 0];
const scales = [300, 300, 1];
const position = [0, 0, 0];

console.log(program);

function render() {
    rotations[0] += 0.01;
    rotations[1] += 0.01;
    rotations[2] += 0.01;
    
    gl.clearColor(-1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // vertex 
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, cubeVBO.itemSize, gl.FLOAT, false, 0, 0);

    // color
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorVBO);
    gl.enableVertexAttribArray(program.aVertexColor);
    gl.vertexAttribPointer(program.aVertexColor, cubeColorVBO.itemSize, gl.FLOAT, false, 0, 0);

    // index

    // 변환 처리
    gl.uniform3fv(program.uRotation, rotations);

    // 픽셀 처리
    gl.uniformMatrix4fv(program.uPixelMatrix, false, pixelMatrix);
    // 스케일 처리
    gl.uniform3fv(program.uScale, scales);

    // 포지션 처리
    gl.uniform3fv(program.uPosition, position);

    // 색깔 쉐이더
   //  gl.uniform3fv(program.uColor, [Math.random(), Math.random(), Math.random()]);

    // 사각형이라서 요렇게
    //    gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeVBO.numItem);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
    gl.drawElements(gl.TRIANGLES, cubeIBO.numItem, gl.UNSIGNED_SHORT, 0);
}

setInterval(render, 16);
