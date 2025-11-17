import {} from "./primitives.js";
import {} from "./transformations.js";
import {} from "./myTransformations.js";
import {} from "./myBuffers.js";

main();

function main(){
  const vsSource = `#version 300 es
    in vec3 aPosition;
    in vec3 aColor;
    in vec3 aNormal;

    uniform float uTime; //time in sec
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelTransformationMatrix;

    out vec3 vNormal;
    out vec3 vFragPos;
    out vec3 vColor;

    void main() {
      vec4 worldPos = uModelViewMatrix * uModelTransformationMatrix * vec4(aPosition, 1.0);
      vFragPos = worldPos.xyz;

      mat3 normalMatrix = transpose(inverse(mat3(uModelViewMatrix * uModelTransformationMatrix)));
      vNormal = normalize(normalMatrix * aNormal);

      gl_Position = uProjectionMatrix * worldPos;
      vColor = aColor;
    }
  `;
  
  const fsSource = `
    #version 300 es
    precision mediump float;

    in vec3 vNormal;
    in vec3 vFragPos;
    in vec3 vColor;

    uniform vec3 uLightPos;
    uniform float uKa;
    uniform float uKd;
    uniform float uKs;
    uniform float uShininess;
    uniform vec3 uAmbientColor;
    uniform vec3 uDiffuseColor;
    uniform vec3 uSpecularColor;
    uniform int uMode;

    out vec4 fragColor;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(uLightPos - vFragPos);

      vec3 ambient = uKa*uAmbientColor;

      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = uKd * diff * uDiffuseColor;

      vec3 viewDir = normalize(-vFragPos);
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
      vec3 specular = uKs * spec * uSpecularColor;

      vec3 result;
      if(uMode == 2) result = ambient;
      else if(uMode == 3) result = diffuse;
      else if(uMode == 4) result = specular;
      else result = ambient + diffuse + specular;

      fragColor = vec4(result * vColor,1.0);
    }
  `;

    function hexToRGB(hex){
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    }

    const ambientSlider = document.getElementById("slider-ka");
    const ambientDisplay = document.getElementById("slider-ka-value");
    const ambientColor = document.getElementById("colorSelectorAmbient");
    function updateAmbientReflection(){
      ambientDisplay.textContent = ambientSlider.value;
      //update ambient reflection
      gl.uniform1f(uKa, parseFloat(ambientSlider.value));
    }
    ambientSlider.addEventListener("input", updateAmbientReflection);

    function updateAmbientColor(){
      //update ambient color
      const color = hexToRGB(ambientColor.value);
      gl.uniform3f(uAmbientColor, color[0], color[1], color[2]);
    }
    ambientColor.addEventListener("input", updateAmbientColor);

    const diffuseSlider = document.getElementById("slider-kd");
    const diffuseDisplay = document.getElementById("slider-kd-value");
    const diffuseColor = document.getElementById("colorSelectorDiffuse");
    function updateDiffuseReflection(){
      diffuseDisplay.textContent = diffuseSlider.value;
      //update diffuse reflection
      gl.uniform1f(uKd, parseFloat(diffuseSlider.value));
    }
    diffuseSlider.addEventListener("input", updateDiffuseReflection);

    function updateDiffuseColor(){
      //update diffuse color
      const color = hexToRGB(diffuseColor.value);
      gl.uniform3f(uDiffuseColor, color[0], color[1], color[2]);
    }
    diffuseColor.addEventListener("input", updateDiffuseColor);

    const specularSlider = document.getElementById("slider-ks");
    const specularDisplay = document.getElementById("slider-ks-value");
    const specularColor = document.getElementById("colorSelectorSpecular");
    function updateSpecularReflection(){
      specularDisplay.textContent = specularSlider.value;
      //update specular reflection
      gl.uniform1f(uKs, parseFloat(specularSlider.value));
    }
    specularSlider.addEventListener("input", updateSpecularReflection);

    function updateSpecularColor(){
      //update specular color
      const color = hexToRGB(specularColor.value);
      gl.uniform3f(uSpecularColor, color[0], color[1], color[2]);
    }
    specularColor.addEventListener("input", updateSpecularColor);

    const shininessSlider = document.getElementById('slider-s');
    const shininessDisplay = document.getElementById('slider-s-value');
    function updateShininess(){
      shininessDisplay.textContent = shininessSlider.value;
      //update shininess
      gl.uniform1f(uShininess, parseFloat(shininessSlider.value));
    }
    shininessSlider.addEventListener("input", updateShininess);

    const backgroundColor = document.getElementById('colorSelector');
    function updateBackgroundColor(){
      //update background color
    }
    backgroundColor.addEventListener("input", updateBackgroundColor);

    const lightPositionX = document.getElementById("slider-x");
    const lightXDisplay = document.getElementById("slider-x-value");
    const lightPositionY = document.getElementById("slider-y");
    const lightYDisplay = document.getElementById("slider-y-value");
    const lightPositionZ = document.getElementById("slider-z");
    const lightZDisplay = document.getElementById("slider-z-value");
    function updateLightPosition(){
      lightXDisplay.textContent = lightPositionX.value;
      lightYDisplay.textContent = lightPositionY.value;
      lightZDisplay.textContent = lightPositionZ.value;
      //update light position
      gl.uniform3f(uLightPos,
        parseFloat(lightPositionX.value),
        parseFloat(lightPositionY.value),
        parseFloat(lightPositionZ.value));
    }
    lightPositionX.addEventListener("input", updateLightPosition);
    lightPositionY.addEventListener("input", updateLightPosition);
    lightPositionZ.addEventListener("input", updateLightPosition);

    const modeSelection = document.getElementById("select_id");
    function modeChanged(){
      const mode = parseInt(modeSelection.value);
      gl.uniform1i(uMode, mode);
    }
    modeSelection.addEventListener("change", modeChanged);

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

    // WebGL setup
    const canvas = document.getElementById("glcanvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) alert("WebGL2 not supported");

    let vertEditor = document.getElementById("vertEditor");
    let fragEditor = document.getElementById("fragEditor");
    vertEditor.value = vsSource;
    fragEditor.value = fsSource;

    let program, posLoc, colorLoc, uMVM, uPM, uMTM;
    let vbo, nbo, ibo;
    let positionBuffer, colorBuffer, indexBuffer;

    let uLightPos, uKa, uKd, uKs, uShininess;
    let uAmbientColor, uDiffuseColor, uSpecularColor, uMode;

    // Buffers
    const myBuffers = initMyBuffers(objects);

    function initShaderProgram(gl, vsSource, fsSource) {
      try {
        program = createProgram(gl, vertEditor.value, fragEditor.value);
        gl.useProgram(program);
        posLoc = gl.getAttribLocation(program, "aPosition");
        colorLoc = gl.getAttribLocation(program, "aColor");
        timeLoc = gl.getUniformLocation(program, "uTime");
        uMVM = gl.getUniformLocation(program, "uModelViewMatrix");
        uPM = gl.getUniformLocation(program, "uProjectionMatrix");
        uMTM = gl.getUniformLocation(program, "uModelTransformationMatrix");

        normalLoc = gl.getAttribLocation(program, "aNormal");
        uLightPos = gl.getUniformLocation(program, "uLightPos");
        uKa = gl.getUniformLocation(program, "uKa");
        uKd = gl.getUniformLocation(program, "uKd");
        uKs = gl.getUniformLocation(program, "uKs");
        uShininess = gl.getUniformLocation(program, "uShininess");
        uAmbientColor = gl.getUniformLocation(program, "uAmbientColor");
        uDiffuseColor = gl.getUniformLocation(program, "uDiffuseColor");
        uSpecularColor = gl.getUniformLocation(program, "uSpecularColor");
        uMode = gl.getUniformLocation(program, "uMode");

        console.log("Shader Locations:", {
          posLoc, colorLoc, normalLoc,
          timeLoc, uMVM, uPM, uMTM,
          uLightPos, uKa, uKd, uKs, uShininess,
          uAmbientColor, uDiffuseColor, uSpecularColor, uMode
        });
      } catch (e) { console.error(e); }
    }
    initShaderProgram(gl, vsSource, fsSource);

    updateAmbientReflection();
    updateAmbientColor();
    updateDiffuseReflection();
    updateDiffuseColor();
    updateSpecularReflection();
    updateSpecularColor();
    updateShininess();
    updateBackgroundColor();
    updateLightPosition();
    modeChanged();

    vertEditor.onkeyup = initShaderProgram;
    fragEditor.onkeyup = initShaderProgram;

    // Mouse and keyboard interactions
    
    let mouseDown = false, lastX, lastY, cubeRotX = 0, cubeRotY = 0;
    let camX = 0, camY = -2.5, camZ = -10;//originally camY = 0, camZ = -6

    function clamp(value, min, max){
      return Math.min(Math.max(value, min), max);
    }

    //my mouse and keyboard vars
    let armMovementX = 1.0;
    let armMovementY = 1.0;
    let armRotation = 0.0;
    let grab = 0.0;
    const minX = 1.0;
    const maxX = 8.0;
    const minY = 0.0;
    const maxY = 6.0;
    
    //my event listners
    document.addEventListener('keydown', e => {
      const armStep = 0.1;
      const armRotStep = Math.PI/80.0;
      switch(e.key){
        case 'w': armMovementX = clamp(armMovementX+armStep, minX, maxX); 
                  armMovementY = clamp(armMovementY+armStep, minY, maxY); break;//move arm up and out
        case 's': armMovementX = clamp(armMovementX-armStep, minX, maxX); 
                  armMovementY = clamp(armMovementY-armStep, minY, maxY); break;//move arm down and in
        case 'a': armRotation -= armRotStep; break;//rotate arm1 left
        case 'd': armRotation += armRotStep; break;//rotate arm1 right
        case '0': grab = 2*Math.PI; break;//grabbers
      }
    });

    let fov = Math.PI / 4, aspect = canvas.width / canvas.height, zNear = 0.1, zFar = 100;
    let f = 1 / Math.tan(fov / 2);
    let proj = new Float32Array([
      f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (zFar + zNear) / (zNear - zFar), -1, 0, 0, (2 * zFar * zNear) / (zNear - zFar), 0
    ]);

    let startTime = Date.now();

    function render() {
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.uniform3f(uLightPos,
        parseFloat(lightPositionX.value),
        parseFloat(lightPositionY.value),
        parseFloat(lightPositionZ.value));

      gl.uniform1f(uKa, parseFloat(ambientSlider.value));
      gl.uniform1f(uKd, parseFloat(diffuseSlider.value));
      gl.uniform1f(uKs, parseFloat(specularSlider.value));
      gl.uniform1f(uShininess, parseFloat(shininessSlider.value));

      const ambientCol = hexToRGB(ambientColor.value);
      const diffuseCol = hexToRGB(diffuseColor.value);
      const specularCol = hexToRGB(specularColor.value);

      gl.uniform3f(uAmbientColor, ambientCol[0], ambientCol[1], ambientCol[2]);
      gl.uniform3f(uDiffuseColor, diffuseCol[0], diffuseCol[1], diffuseCol[2]);
      gl.uniform3f(uSpecularColor, specularCol[0], specularCol[1], specularCol[2]);

      gl.uniform1i(uMode, parseInt(document.getElementById("select_id").value));

      // rotation matrices
      let cx = Math.cos(cubeRotY), sx = Math.sin(cubeRotY);
      let cy = Math.cos(cubeRotX), sy = Math.sin(cubeRotX);
      let rotX = [1, 0, 0, 0, 0, cy, sy, 0, 0, -sy, cy, 0, 0, 0, 0, 1];
      let rotY = [cx, 0, -sx, 0, 0, 1, 0, 0, sx, 0, cx, 0, 0, 0, 0, 1];
      let cubeRotation = multiplyMat4(rotY, rotX);

      // init model-view matrix as identity matrix
      let modelViewMatrix = mat4Identity();
      // init model transformation matrix as identity matrix
      let modelTransformationMatrix = mat4Identity();

      //delta time in ms
      let deltaTime = Date.now() - startTime;
      // object rotation
      modelTransformationMatrix = multiplyMat4(modelTransformationMatrix, cubeRotation);
      // camera translation
      modelViewMatrix = mat4Translate(modelViewMatrix, [camX, camY, camZ]);
      
      //set time in seconds
      gl.uniform1f(timeLoc, deltaTime/1000.0);
      gl.uniformMatrix4fv(uPM, false, proj);
      gl.uniformMatrix4fv(uMVM, false, modelViewMatrix);
      gl.uniformMatrix4fv(uMTM, false, modelTransformationMatrix);

      const angle = deltaTime * 0.000001;

      bindMyBuffers(myBuffers, deltaTime, armMovementX, armMovementY, armRotation, grab,
      modelViewMatrix, modelTransformationMatrix);

      const error = gl.getError();
      if(error !== gl.NO_ERROR){
        console.error("WebGL Error: ", error);
      }
    }

    // Initialize when page loads
    window.onload = function () {
      setInterval(render, 30);
    }
}