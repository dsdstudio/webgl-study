const canvas = document.getElementById('glcanvas');
const gl = BGL.initGL(canvas);
const vshader = BGL.createShader(`
attribute vec3 aVertexPosition;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
}`, 'vs');
const fshader = BGL.createShader(`
    precision mediump float;
    void main(void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`, 'fs');
const program = BGL.createProgram(vshader, fshader);
program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');

requestAnimationFrame(render);

var time = 90;
function render() {
    resize(canvas);
    var buffer = createRegularTriangleBuffer(4);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(-1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0);

    // primitives : POINTS, LINE_STRIP, TRIANGLES TRIANGLE_STRIP TRIANGLE_FAN
    gl.drawArrays(gl.LINE_STRIP, 0, buffer.numItem);

    requestAnimationFrame(render);
}
function createRegularTriangleBuffer(n) {
    // 원의 반지름음 0.5라 가정
    var buf = [], r = 0.5, c = Math.cos, s = Math.sin;
    var angleStep = 360 / n;
    // 중점
    var center = { x:0.0, y:0.0 };
    var startAngle = (time += 1);
    var i = n;
    buf.push(0.0, 0.0, 0.0);

    while(i--) {
        buf.push(center.x + c(rad(startAngle)) * r, center.y + s(rad(startAngle)) * r, 0.0);
        startAngle += angleStep;
    }
    
    buf.push(center.x + c(rad(startAngle)) * r, center.y + s(rad(startAngle)) * r, 0.0);

    return BGL.createBuffer(buf, 3);
}

function resize(c) {
    let w = c.clientWidth, h = c.clientHeight;
    if ( c.width !== w || c.height !== h ) c.width = w, c.height = h;
}
