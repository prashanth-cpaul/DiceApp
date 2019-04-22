import React, { Component } from 'react'
import './styles/app.css'
import * as glMatrix from 'gl-matrix'
import { loadTexture } from './lib/textureLoader'
import { createShaderProgram } from './lib/shaders'
import { initBuffers, Buffers } from './lib/initBuffers'
interface ProgramInfo {
  program: WebGLProgram
  attribLocations: {
    vertexPosition: number;
    textureCoord: number;
  }
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
    sampler: WebGLUniformLocation | null;
  }
}

let cubeRotation = 0.0
export default class App extends Component<{}, {}> {
  // methods

  drawScene = (
    gl: WebGLRenderingContext,
    programInfo: ProgramInfo,
    buffers: Buffers,
    texture: WebGLTexture,
    deltaTime: number
  ) => {
    // Set a color for the background
    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL) // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const projectionMatrix = glMatrix.mat4.create()
    const fieldOfView = glMatrix.glMatrix.toRadian(45) // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    glMatrix.mat4.perspective(
      projectionMatrix,
      fieldOfView,
      aspect,
      zNear,
      zFar
    )

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = glMatrix.mat4.create()

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    glMatrix.mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0.0, 0.0, -8.0] // amount to translate
    )

    glMatrix.mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation, // amount to rotate in radians
      [0, 0, 1] // axis to rotate around (Z)
    )
    glMatrix.mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.7, // amount to rotate in radians
      [1, 0, 0] // axis to rotate around (X)
    )
    glMatrix.mat4.rotate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to rotate
      cubeRotation * 0.5, // amount to rotate in radians
      [0, 1, 0] // axis to rotate around (Y)
    )

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexPositions)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      3, // pull out 3 values per iteration
      gl.FLOAT, // the data in the buffer is 32bit floats
      false, // don't normalize
      0, // how many bytes to get from one set of values to the next
      0 // how many bytes inside the buffer to start from
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)

    // Tell WebGL how to pull out the texture coordinates from buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      2, // pull out 2 values per iteration
      gl.FLOAT, // the data in the buffer is 32bit floats
      false, // don't normalize
      0, // how many bytes to get from one set of values to the next
      0 // how many bytes inside the buffer to start from
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord)

    // Tell WebGL which element indices to use to draw the shape
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program)

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    )
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    )
    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0)

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.sampler, 0)

    const vertexCount = 36 // Since each face of our cube is comprised of two triangles, there are 6 vertices per side, or 36 total vertices in the cube, even though many of them are duplicates.
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0)

    // Update the rotation for the next draw
    cubeRotation += deltaTime
  }

  drawStuff = async () => {
    // Initialize webgl
    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    let gl = canvas.getContext('webgl')

    if (!gl) {
      // fallback for IE and Edge
      console.log('WebGL not supported, falling back on experimental-webgl')
      gl = canvas.getContext('experimental-webgl')
    }

    if (!gl) {
      alert('Your browser does not support WebGL')
      return
    }

    // Create shader program and link vertex and fragment shaders
    let shaderProgram = createShaderProgram(gl)

    if (!shaderProgram) {
      return
    }

    gl.validateProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
      console.error(
        'ERROR validating program!',
        gl.getProgramInfoLog(shaderProgram)
      )
      return
    }

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'vertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'textureCoord')
      },
      // transformation matrices
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'mProj'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'mView'),
        sampler: gl.getUniformLocation(shaderProgram, 'sampler')
      }
    }

    const diceType = 'd6'
    const buffers = await initBuffers(gl, diceType)

    const texture = loadTexture(gl, `images/${diceType}-texture.png`)

    let then = 0
    let renderLoop = () => {
      const now = performance.now() * 0.001 // convert to seconds
      const deltaTime = now - then
      then = now

      if (!gl || !texture) {
        return
      }
      this.drawScene(gl, programInfo, buffers, texture, deltaTime)

      requestAnimationFrame(renderLoop)
    }
    requestAnimationFrame(renderLoop)
  }

  // hooks
  componentDidMount () {
    this.drawStuff().catch(err => console.log(err))
  }

  render () {
    return (
      <div className='app'>
        <canvas id='canvas' width='800' height='600'>
          Your browser does not support HTML5
        </canvas>
      </div>
    )
  }
}
