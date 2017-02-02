(function(WIN) {
    class BGL {
        /**
         * webgl context 를 초기화한다.
         **/
        static initGL($canvasEl) {
            var gl, keys = 'webgl,experimental-webgl,webkit-3d,moz-webgl'.split(','), i = keys.length;
            while (i--) if (gl = $canvasEl.getContext(keys[i])) break;
            if (gl) console.log('webgl 초기화 성공!');
            else console.log('webgl 초기화 실패!');
            return gl;
        }
        /**
         * shader 를 생성한다. 
         **/
        static createShader($shaderStr, $type) {
            let shader;
            shader = gl.createShader({
                vs:gl.VERTEX_SHADER,
                fs:gl.FRAGMENT_SHADER
            }[$type]);
            gl.shaderSource(shader, $shaderStr);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) throw ( 'shader compile error : ' + gl.getShaderInfoLog(shader));
            return shader;
        }
        /**
         *  프로그램을 생성한다.
         **/
        static createProgram() {
            let program = gl.createProgram(), i, n;
            for ( i = 0, n = arguments.length; i<n; i++ ) gl.attachShader(program, arguments[i]);
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
        static createBuffer($arr, $itemSize) {
            let buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array($arr), gl.STATIC_DRAW);
            buf.itemSize = $itemSize;
            buf.numItem = $arr.length / $itemSize;
            return buf;
        }
        /**
         * webgl index buffer object를 생성한다.
         * vertex 를 어떤순서대로 그릴것인지에 대한 정보를 담은 버퍼 오브젝트이다.
         **/
        static createElementBuffer($arr) {
            let buf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array($arr), gl.STATIC_DRAW);
            buf.numItem = $arr.length;
            return buf;
        }
        static createCubeBuffer() {
            var t0 = [
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
            ];
            return BGL.createBuffer(t0, 3);
        }
        static createCubeIndexBuffer() {
            return BGL.createElementBuffer([
                0, 1, 2, 0, 2, 3,
                4, 5, 6, 4, 6, 7,
                8, 9, 10, 8, 10, 11,
                12, 13, 14, 12, 14, 15,
                16, 17, 18, 16, 18, 19,
                20, 21, 22, 20, 22, 23
            ]);
        }
    }    

    Object.freeze(BGL);

    // NAMESPACE  노출
    WIN.BGL = BGL;
})(this);
