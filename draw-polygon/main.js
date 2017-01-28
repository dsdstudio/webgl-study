const canvas = document.getElementById('glcanvas');
const gl = BGL.initGL(canvas);
const vshader = BGL.createShader(`
attribute vec3 aVertexPosition;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
    gl_PointSize = 5.0;
}`, 'vs');
const fshader = BGL.createShader(`
    precision mediump float;
    void main(void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`, 'fs');
const program = BGL.createProgram(vshader, fshader);
program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');

const bufferList = {
    3:BGL.createBuffer([
    ], 3),
    4:BGL.createBuffer([
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
        -0.5, 0.5, 0.0,
        -0.5, 0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5, 0.5, 0.0
    ], 3)
};

function createRegularTriangleBuffer(n) {
    var buf = [], r = 0.5, c = Math.cos, s = Math.sin;
    // 원의 반지름음 0.5라 가정
    var angleStep = 360 / n;
    // 중점
    var center = {
        x:0.0,
        y:0.0
    };
    var i = n;
    var angle = 90;
    buf.push(0.0, 0.0, 0.0);

    while(i--) {
        var rad = Math.PI * angle / 180;
        buf.push(center.x + c(rad) * r, center.y + s(rad) * r, 0.0);
        angle += angleStep;
    }
    rad = Math.PI * angle / 180;
    buf.push(center.x + c(rad) * r, center.y + s(rad) * r, 0.0);

    // 중점으로부터 angle만큼의 거리를
    console.log(n, buf);
    return BGL.createBuffer(buf, 3);
}

setInterval(function() {
    render(createRegularTriangleBuffer(rand(3,20)));
}, 1000);
function render(buffer) {
    resize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(-1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0);

    // primitives : POINTS, LINE_STRIP, TRIANGLES TRIANGLE_STRIP TRIANGLE_FAN
    gl.drawArrays(gl.TRIANGLE_FAN, 0, buffer.numItem);
}

function rand(min, max) { return Math.floor(min + (Math.random() * (max - min))); }

function resize(c) {
    let w = c.clientWidth, h = c.clientHeight;

    if ( c.width !== w || c.height !== h ) c.width = w, c.height = h;
}
