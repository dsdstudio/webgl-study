const canvas = document.getElementById('glcanvas');
const gl = BGL.initGL(canvas);
const cubeVBO = BGL.createCubeBuffer();
const cubeIBO = BGL.createCubeIndexBuffer();

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
    for (var j=0; j<6; j++) for (var i=0; i<4; i++) generatedColors = generatedColors.concat(colors[j]);
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

var w = canvas.clientWidth;
var h = canvas.clientHeight;
var angle = 60;

initScreen();
requestAnimationFrame(render);
addEventListeners();

function initScreen() {
    // viewport 설정
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    canvas.width = window.innerWidth, canvas.height = window.innerHeight;
}
function addEventListeners() {
    window.addEventListener('resize', function() {
        canvas.width = canvas.clientWidth, canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, w, h);
        w = canvas.clientWidth;
        h = canvas.clientHeight;

    }, false);
    document.addEventListener('mousedown', function(e) {
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
        function onMouseMove(e) {
            e.preventDefault();
            var relativeAngle = e.pageX / e.target.clientWidth * 360;
            console.log('mousemove', e.pageX, e.pageY, e.target.clientWidth, e.target.clientHeight, relativeAngle);
            angle = relativeAngle;
        }
        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            console.log('mouseup');
        }
        console.log('mousedown');
    }, false);
}

var va = 0;
function render(now) {
    va += 1;
    const mvMatrix = mat4.create();
    mat4.identity(mvMatrix);
    mat4.rotate(mvMatrix, rad(180), [0,0,1], mvMatrix);
    mat4.translate(mvMatrix, [5,0,0], mvMatrix);

    const projectionMatrix = mat4.create();
    mat4.perspective(angle, w/h, 0.1, 100.0, projectionMatrix);
    mat4.identity(mvMatrix);
    mat4.lookAt([Math.cos(rad(va))*8, Math.sin(rad(va*.5)) * 5, 2], [0, 0, 0], [0, 1, 0], mvMatrix);
    mat4.translate(mvMatrix, [0.0, 1.0, 0.0], mvMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    // vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, cubeVBO.itemSize, gl.FLOAT, false, 0, 0);

    // 모델 뷰 처리
    gl.uniformMatrix4fv(program.uMVMatrix, false, mvMatrix);
    
    // 카메라 처리
    gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
    
    // color
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorVBO);
    gl.enableVertexAttribArray(program.aVertexColor);
    gl.vertexAttribPointer(program.aVertexColor, cubeColorVBO.itemSize, gl.FLOAT, false, 0, 0);

    // index 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
    gl.drawElements(gl.TRIANGLES, cubeIBO.numItem, gl.UNSIGNED_SHORT, 0);
    
    requestAnimationFrame(render);
}
