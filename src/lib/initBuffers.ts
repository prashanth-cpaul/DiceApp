export interface Buffers {
  vertexPositions: WebGLBuffer | null
  indices: WebGLBuffer | null
  textureCoord: WebGLBuffer | null
}

interface DiceConfig {
  vertexPositions: number[]
  triangleVertexIndices: number[]
  textureCoordinates: number[]
}

type DiceType = 'd6'

export const initBuffers: (
  gl: WebGLRenderingContext,
  diceType: DiceType
) => Promise<Buffers> = async (gl, diceType) => {
  const {
    vertexPositions,
    triangleVertexIndices,
    textureCoordinates
  }: DiceConfig = await import(`../diceConfig/${diceType}`)

  // Create buffer for the box vertex positions
  const boxVertexPositionBuffer = gl.createBuffer()
  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexPositionBuffer)
  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertexPositions),
    gl.STATIC_DRAW
  )

  // Create buffer for the box face triangle indices
  const boxIndexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(triangleVertexIndices),
    gl.STATIC_DRAW
  )

  // Create buffer for the box face textures
  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW
  )

  return {
    vertexPositions: boxVertexPositionBuffer,
    indices: boxIndexBuffer,
    textureCoord: textureCoordBuffer
  }
}
