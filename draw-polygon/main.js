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

const bufferList = {
    3:BGL.createBuffer([
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0
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
    var buf = [], r = 0.5, angle = 2*Math.PI/n,
        c = Math.cos, s = Math.sin;

    buf.push(0.0, 0.0, 0.0);
    for ( var i = 0; i < n ; i ++ ){
        buf.push (r * c(angle), r * s(angle), 0.0);
    }

    console.log(buf);
    return BGL.createBuffer(buf, 3);
}

setInterval(function() {
    render(createRegularTriangleBuffer(rand(3,10)));
}, 1000);
function render(buffer) {
    resize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(-1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    console.log(buffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, buffer.itemSize);
}
function rand(min, max) { return Math.floor(min + (Math.random() * (max - min))); }

function resize(c) {
    let w = c.clientWidth, h = c.clientHeight;

    if ( c.width !== w || c.height !== h ) c.width = w, c.height = h;
}
