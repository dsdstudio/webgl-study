const gl = BGL.initGL(document.getElementById('glcanvas'));

const cubeVBO = BGL.createBuffer([
// Front face
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // Back face
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,

    // Top face
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,

    // Bottom face
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,

    // Right face
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5,  0.5,

    // Left face
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5
], 3);

const cubeIBO = BGL.createElementBuffer([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
]);

const cubeColorVBO = (function(){
    var colors = [
        [1.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0]     // Left face: purple
    ];
    var generatedColors = [];
    for (var j=0; j<6; j++) {
        for (var i=0; i<4; i++) generatedColors = generatedColors.concat(colors[j]);
    }
    return BGL.createBuffer(generatedColors, 4);
})();

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
  mat4 m1 = mat4(1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);
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
program.aVertexColor = gl.getAttribLocation(program, 'aVertexColor');

const w = 500;
const h = 500;
gl.viewport(0, 0, w, h);

const pixelMatrix = [
    2/w,0,0,0,
    0,2/h,0,0,
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

    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(-1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // vertex 
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, cubeVBO.itemSize, gl.FLOAT, false, 0, 0);

    // 변환 처리
    gl.uniform3fv(program.uRotation, rotations);

    // 픽셀 처리
    gl.uniformMatrix4fv(program.uPixelMatrix, false, pixelMatrix);
    // 스케일 처리
    gl.uniform3fv(program.uScale, scales);

    // 포지션 처리
    gl.uniform3fv(program.uPosition, position);

    // color
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorVBO);
    gl.enableVertexAttribArray(program.aVertexColor);
    gl.vertexAttribPointer(program.aVertexColor, cubeColorVBO.itemSize, gl.FLOAT, false, 0, 0);

    // index 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
    gl.drawElements(gl.TRIANGLES, cubeIBO.numItem, gl.UNSIGNED_SHORT, 0);
}

setInterval(render, 16);
