function initGL($canvasEl) {
    var gl, keys = 'webgl,experimental-webgl,webkit-3d,moz-webgl'.split(','), i = keys.length;
    while (i--) if (gl = $canvasEl.getContext(keys[i])) break;
    if (gl) console.log('webgl 초기화 성공!');
    else console.log('webgl 초기화 실패!');
    return gl;
}
function createShader($shaderStrArr, $type) {
    var shader, shaderTypeMap;
    shaderTypeMap = { 'vs':gl.VERTEX_SHADER,'fs':gl.FRAGMENT_SHADER };

    shader = gl.createShader(shaderTypeMap[$type]);
    gl.shaderSource(shader, $shaderStrArr.join('\n'));
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) throw ( 'shader compile error : ' + gl.getShaderInfoLog(shader));
    return shader;
}
function createProgram() {
    var program = gl.createProgram();
    for ( var i = 0, n = arguments.length; i<n; i++ ) gl.attachShader(program, arguments[i]);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw ( 'program link error : ' + gl.getShaderInfoLog(program));
    return program;
}
/**
 * webgl 버퍼를 생성한다.
 * @param $arr 정점 데이터
 * @param $itemSize 데이터를 구성하는 구성요소 사이즈[x1,y1,z1, x2,y2,z2] -> 3 
 * @return WebGLBuffer{itemSize:$itemSize, numItem:$arr.length/$itemSize}
 * */
function createBuffer($arr, $itemSize) {
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array($arr), gl.STATIC_DRAW);
	buf.itemSize = $itemSize;
	buf.numItem = $arr.length / $itemSize;
	return buf;
}
