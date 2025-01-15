/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-30 18:30:52
 * @Description: WebGL播放器
 */

/**
 * webgl播放器
 * 源码：@see https://github.com/p4prasoon/YUV-Webgl-Video-Player
 * 关于WebGL API 参考：
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL_API
 */

type WebGLRenderingContextExtends = WebGLRenderingContext & {
    y: Texture
    u: Texture
    v: Texture
}

class Texture {
    private readonly gl: WebGLRenderingContextExtends
    private readonly texture: WebGLTexture

    constructor(gl: WebGLRenderingContextExtends) {
        this.gl = gl
        this.texture = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, this.texture)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }

    bind(n: number, program: WebGLProgram, name: string) {
        const gl = this.gl
        gl.activeTexture([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2][n])
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(gl.getUniformLocation(program, name), n)
    }

    fill(width: number, height: number, data: ArrayBufferView) {
        const gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data)
    }
}

export default function WebGLPlayer(canvas: HTMLCanvasElement, option: Record<string, any>) {
    const gl = (canvas.getContext('webgl', { preserveDrawingBuffer: true, ...option }) ||
        canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true, ...option })) as WebGLRenderingContextExtends
    let viewWidth = gl.canvas.width // gl上下文窗口宽度
    let viewHeight = gl.canvas.height // gl上下文窗口高度
    let viewLeft = 0 // gl上下文窗口left
    let viewBottom = 0 // gl上下文窗口bottom

    if (!gl) {
        console.log('[ER] WebGL not supported.')
    } else {
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
        const program = gl.createProgram()!
        const vertexShaderSource = [
            'attribute highp vec4 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'varying highp vec2 vTextureCoord;',
            'void main(void) {',
            ' gl_Position = aVertexPosition;',
            ' vTextureCoord = aTextureCoord;',
            '}',
        ].join('\n')
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
        gl.shaderSource(vertexShader, vertexShaderSource)
        gl.compileShader(vertexShader)
        const fragmentShaderSource = [
            'precision highp float;',
            'varying lowp vec2 vTextureCoord;',
            'uniform sampler2D YTexture;',
            'uniform sampler2D UTexture;',
            'uniform sampler2D VTexture;',
            'const mat4 YUV2RGB = mat4',
            '(',
            ' 1.1643828125, 0, 1.59602734375, -.87078515625,',
            ' 1.1643828125, -.39176171875, -.81296875, .52959375,',
            ' 1.1643828125, 2.017234375, 0, -1.081390625,',
            ' 0, 0, 0, 1',
            ');',
            'void main(void) {',
            ' gl_FragColor = vec4( texture2D(YTexture, vTextureCoord).x, texture2D(UTexture, vTextureCoord).x, texture2D(VTexture, vTextureCoord).x, 1) * YUV2RGB;',
            '}',
        ].join('\n')

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
        gl.shaderSource(fragmentShader, fragmentShaderSource)
        gl.compileShader(fragmentShader)
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        gl.useProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('[ER] Shader link failed.')
        }
        const vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
        gl.enableVertexAttribArray(vertexPositionAttribute)
        const textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord')
        gl.enableVertexAttribArray(textureCoordAttribute)

        const verticesBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0]), gl.STATIC_DRAW)
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)
        const texCoordBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]), gl.STATIC_DRAW)
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0)

        gl.y = new Texture(gl)
        gl.u = new Texture(gl)
        gl.v = new Texture(gl)
        gl.y.bind(0, program, 'YTexture')
        gl.u.bind(1, program, 'UTexture')
        gl.v.bind(2, program, 'VTexture')
    }

    /**
     * @description 渲染帧
     * @param {Uint8Array} videoFrame
     * @param {number} width
     * @param {number} height
     * @param {number} uOffset
     * @param {number} vOffset
     */
    const renderFrame = (videoFrame: Uint8Array, width: number, height: number, uOffset: number, vOffset: number) => {
        if (!gl) {
            console.log('[ER] Render frame failed due to WebGL not supported.')
            return
        }

        gl.viewport(viewLeft, viewBottom, viewWidth, viewHeight)
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.y.fill(width, height, videoFrame.subarray(0, uOffset))
        gl.u.fill(width >> 1, height >> 1, videoFrame.subarray(uOffset, uOffset + vOffset))
        gl.v.fill(width >> 1, height >> 1, videoFrame.subarray(uOffset + vOffset, videoFrame.length))

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    /**
     * @description 获取gl上下文窗口坐标及宽高
     * @returns {Object}
     */
    const getViewport = () => {
        return {
            left: viewLeft,
            bottom: viewBottom,
            viewWidth: viewWidth,
            viewHeight: viewHeight,
        }
    }

    /**
     * @description 设置gl上下文窗口坐标及宽高
     * @param {number} left
     * @param {number} bottom
     * @param {number} width
     * @param {number} height
     */
    const setViewport = (left: number, bottom: number, width: number, height: number) => {
        viewLeft = left
        viewBottom = bottom
        viewWidth = width
        viewHeight = height
    }

    /**
     * @description 清除画布
     */
    const clear = () => {
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    const fullscreen = () => {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen()
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen()
        } else {
            alert("This browser doesn't supporter fullscreen")
        }
    }

    const exitfullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
        } else {
            alert("Exit fullscreen doesn't work")
        }
    }

    return {
        renderFrame,
        getViewport,
        setViewport,
        clear,
        fullscreen,
        exitfullscreen,
    }
}
