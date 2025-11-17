main();

function main(){  
  // --- WebGL init --- //
  const canvas = document.getElementById("glcanvas");
  const vsEditor = document.getElementById("vertEditor");
  const fsEditor = document.getElementById("fragEditor");

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

  let program, posLoc, colorLoc, timeLoc;
  let posBuffer, colorBuffer;
  
  //Triangle script here
  // --- Triangle ---
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
  
  function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function createProgram(gl, vsSource, fsSource) {
    let vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    let fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    let prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog));
    }
    return prog;
  }


  // --- Buffers ---
  function initBuffers() {
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  }

  initBuffers();

  function initShaderProgram() {
    try {
      program = createProgram(gl, vsEditor.value, fsEditor.value);
      gl.useProgram(program);
      posLoc = gl.getAttribLocation(program, "aPosition");
      colorLoc = gl.getAttribLocation(program, "aColor");
      timeLoc = gl.getUniformLocation(program, "uTime");
    } catch (e) { console.error(e); }
  }

  initShaderProgram();

  //hot compile when any input in the playground text area
  vsEditor.onkeyup = initShaderProgram;
  fsEditor.onkeyup = initShaderProgram;

  let startTime = Date.now();
  function render() {
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