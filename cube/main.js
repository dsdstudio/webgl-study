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

uniform mat4 uMVMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
}`, 'vs');
const fshader = BGL.createShader(`
    varying lowp vec4 vColor;
    
    void main(void) {
        gl_FragColor = vColor;
    }
`,'fs');

const program = BGL.createProgram(vshader, fshader);
program.uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
program.uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');

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

var  mvMatrix = mat4.create();
mat4.identity(mvMatrix);
mat4.translate(mvMatrix, [5,0,0], mvMatrix);
mat4.rotate(mvMatrix, Math.PI/4, [0,0,1], mvMatrix); 

var projectionMatrix = mat4.create();
mat4.perspective(60, 1, 0.1, 100.0, projectionMatrix);
mat4.identity(mvMatrix);
mat4.lookAt([8, 5, 10], [0, 0, 0], [0, 1, 0], mvMatrix);
mat4.translate(mvMatrix, [0.0, 1.0, 4.0], mvMatrix);


console.log(program, mvMatrix, projectionMatrix);

gl.clearColor(0, 0, 0, 1);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

function render() {
    rotations[0] += 0.01;
    rotations[1] += 0.01;
    rotations[2] += 0.01;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // vertex 
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, cubeVBO.itemSize, gl.FLOAT, false, 0, 0);

    // 카메라 처리
    gl.uniformMatrix4fv(program.uMVMatrix, false, mvMatrix);
    gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
    
    // color
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorVBO);
    gl.enableVertexAttribArray(program.aVertexColor);
    gl.vertexAttribPointer(program.aVertexColor, cubeColorVBO.itemSize, gl.FLOAT, false, 0, 0);

    // index 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
    gl.drawElements(gl.TRIANGLES, cubeIBO.numItem, gl.UNSIGNED_SHORT, 0);
}

setInterval(render, 16);
