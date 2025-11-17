import { initBuffers } from "./buffers.js";

main();
function main(){  
  const canvas = document.querySelector("#glcanvas");
  const vsEditor = document.querySelector("#vsEditor");
  const fsEditor = document.querySelector("#fsEditor");

  //Initialize the GL context
  const gl = canvas.getContext("webgl2");
  //Only continue if WebGL is available and working
  if (!gl) alert("WebGL2 not supported");

  //Vertex shader program
  const vsSource = `#version 300 es
  in vec3 aPosition;
  in vec3 aColor;

  uniform float uTime; //time in sec
  out vec3 vColor;

  void main() {
    mat4 rotation = mat4(
      cos(uTime), -sin(uTime), 0, 0,
      sin(uTime), cos(uTime) , 0, 0,
      0         , 0          , 1, 0,
      0         , 0          , 0, 1
    );

    vec4 pos = rotation * vec4(aPosition, 1./abs(sin(uTime)));
    gl_Position = pos;
    vColor = (pos.xyz + 1.0)*0.6;
  }
  `;
  
  //Fragment shader program
  const fsSource = `#version 300 es
    precision mediump float;
    in vec3 vColor;

    out vec4 fragColor;

    void main() {
      fragColor = vec4(vColor, 1.0);
    }
  `;

  vsEditor.value = vsSource;
  fsEditor.value = fsSource;

  //Initialize shader program
  const shaderProgram = initShaderProgram(gl, vsEditor, fsEditor);

  //Collet all the data to use the shader program
  let posLoc = gl.getAttribLocation(shaderProgram, "aPosition");
  let colorLoc = gl.getAttribLocation(shaderProgram, "aColor");
  let timeLoc = gl.getUniformLocation(shaderProgram, "uTime");

  const programInfo = {
    program: shaderProgram,
    attribLocations:{
      posLoc: gl.getAttribLocation(shaderProgram, "aPosition"),
      colorLoc: gl.getAttribLocation(shaderProgram, "aColor"),
    },
    uniformLocations:{
      timeLoc: gl.getUniformLocation(shaderProgram, "uTime")
    }
  };
  
  // --- Init Primitives --- //
  const positions = new Float32Array([
    0.0,  1.0, 0.0,  // vertex 1
    -1.0, 0.0, 0.0,  // vertex 2
    1.0, 0.0, 0.0   // vertex 3
  ]);

  const colors = new Float32Array([
    1.0, 0.0, 0.0,  // Red
    0.0, 1.0, 0.0,  // Green
    0.0, 0.0, 1.0   // Blue
  ]);
  
  // --- Init Buffers --- //
  const buffers = initBuffers(gl, positions, colors);
  const posBuffer = buffers.posBuffer;
  const colorBuffer = buffers.colorBuffer;

  // --- Init EventListners --- //
  vsEditor.onkeyup = initShaderProgram(gl, vsEditor, fsEditor);
  fsEditor.onkeyup = initShaderProgram(gl, vsEditor, fsEditor);

  // --- Render --- //
  let startTime = Date.now();
  function render(){
    //clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Position buffer binding
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // Color buffer binding
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    //delta time in ms
    let deltaTime = Date.now() - startTime;
    //set time in seconds
    gl.uniform1f(timeLoc, deltaTime/1000.0);

    // Draw content
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Initialize when page loads
  window.onload = function () {
    setInterval(render, 30);
  };
}

function initShaderProgram(gl, vsEditor, fsEditor){
  //Create the shader program
  const program = gl.createProgram(gl, vsEditor.value, fsEditor.value);
  gl.useProgram(program);

  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

function loadShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}