const vertexShaderSource = `
  attribute vec4 vertexPosition;
  attribute vec2 textureCoord;

  varying highp vec2 fragTexture;

  uniform mat4 mView;
  uniform mat4 mProj;

  void main()
  {
    fragTexture = textureCoord;
    gl_Position = mProj * mView * vertexPosition;
  }
`

const fragmentShaderSource = `
  varying highp vec2 fragTexture;

  uniform sampler2D sampler;

  void main()
  {
    gl_FragColor = texture2D(sampler, fragTexture);
  }
`

const createShader: (
  gl: WebGLRenderingContext,
  type: number
) => WebGLShader | null = (gl, type) => {
  const source =
    type === gl.VERTEX_SHADER ? vertexShaderSource : fragmentShaderSource
  const shader = gl.createShader(type)
  if (!shader) {
    console.error('An error occurred creating the shaders.')
    return null
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      'An error occurred compiling the shaders: ',
      gl.getShaderInfoLog(shader)
    )
    gl.deleteShader(shader)
    return null
  }

  return shader
}

export const createShaderProgram: (
  gl: WebGLRenderingContext
) => WebGLProgram | null = gl => {
  // Create and compile shaders
  let vertexShader = createShader(gl, gl.VERTEX_SHADER)
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER)
  if (!vertexShader || !fragmentShader) {
    return null
  }

  let shaderProgram = gl.createProgram()
  if (!shaderProgram) {
    console.error('An error occurred creating the shader program.')
    return null
  }
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      'Unable to initialize the shader program: ',
      gl.getProgramInfoLog(shaderProgram)
    )
    gl.deleteProgram(shaderProgram)
    return null
  }
  return shaderProgram
}
