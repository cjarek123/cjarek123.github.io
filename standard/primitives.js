function generateCube(size){
  const nVertices = 8;
  const w = size/2;
  const vertices = new Float32Array([
    -w,-w,-w,
     w,-w,-w,
     w, w,-w,
    -w, w,-w,
    -w,-w, w,
     w,-w, w,
     w, w, w,
    -w, w, w
  ]);
  const colors = new Float32Array(nVertices*3);
  const f = 1/Math.sqrt(3);
  const normals = new Float32Array([
    -f,-f,-f,
     f,-f,-f,
     f, f,-f,
    -f, f,-f,
    -f,-f, f,
     f,-f, f,
     f, f, f,
    -f, f, f
  ]);
  const indices = new Uint16Array([
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    0,1,5, 0,5,4,
    2,3,7, 2,7,6,
    0,3,7, 0,7,4,
    1,2,6, 1,6,5
  ]);

  //generate colors
  for(let i = 0; i < nVertices; i++){
    const offset = i*3;
    colors[offset + 0] = 0.25;
    colors[offset + 1] = 0.25;
    colors[offset + 2] = 0.25;
  }

  return [vertices, colors, indices, normals];
}

function generateCylinder(r, h, n = 64){
  const nVertices = n*2 + 2;//number of vertices
  const vertices = new Float32Array(nVertices*3);
  const normals = new Float32Array(nVertices*3);
  const colors = new Float32Array(nVertices*3);
  const indices = new Uint16Array(n*12);

  //generate vertices
  for(let i = 0; i < n; i++){
    const angle = (2*Math.PI*i) / n;
    const offset = i*6;

    //top circle vertices
    vertices[offset + 0] = r*Math.cos(angle);
    vertices[offset + 1] = h;
    vertices[offset + 2] = r*Math.sin(angle);

    //bottom circle vertices
    vertices[offset + 3] = r*Math.cos(angle);
    vertices[offset + 4] = 0.0;
    vertices[offset + 5] = r*Math.sin(angle);

    //set colors
    for(let j = 0; j < 6; j++){
      colors[offset + j] = 0.5;
    }

    //generate normal vectors for each vertex
    normals[offset + 0] = Math.cos(angle);
    normals[offset + 1] = Math.sin(angle);
    normals[offset + 2] = 0.0;
    normals[offset + 3] = Math.cos(angle);
    normals[offset + 4] = Math.sin(angle);
    normals[offset + 5] = 0.0;
  }

  //offsets for the top and bottom faces
  const topFaceIndex = n * 2;
  const bottomFaceIndex = n * 2 + 1;
  const topFaceOffset = topFaceIndex * 3;
  const bottomFaceOffset = bottomFaceIndex * 3;

  //vertices for the top face
  vertices[topFaceOffset + 0] = 0.0;
  vertices[topFaceOffset + 1] = h;
  vertices[topFaceOffset + 2] = 0.0;

  //vertices for the bottom face
  vertices[bottomFaceOffset + 0] = 0.0;
  vertices[bottomFaceOffset + 1] = 0.0;
  vertices[bottomFaceOffset + 2] = 0.0;

  for(let j = 0; j < 3; j++){
    colors[topFaceOffset + j] = 1.0;
    colors[bottomFaceOffset + j] = 1.0;
  }

  //generate the normals for the top and bottom face
  normals[topFaceOffset + 0] = 0.0;
  normals[topFaceOffset + 1] = 0.0;
  normals[topFaceOffset + 2] = 1.0;
  normals[bottomFaceOffset + 0] = 0.0;
  normals[bottomFaceOffset + 1] = 0.0;
  normals[bottomFaceOffset + 2] = -1.0;

  //generate indices
  let index = 0;
  for(let i = 0; i < n; i++){
    const nextFace = (i+1) % n;

    indices[index++] = i*2;
    indices[index++] = nextFace*2;
    indices[index++] = i*2 + 1;

    indices[index++] = nextFace*2;
    indices[index++] = nextFace*2 + 1;
    indices[index++] = i*2 + 1;

    indices[index++] = topFaceIndex;
    indices[index++] = i*2;
    indices[index++] = nextFace*2;

    indices[index++] = bottomFaceIndex;
    indices[index++] = i*2 + 1;
    indices[index++] = nextFace*2 + 1;
  }

  return [vertices, colors, indices, normals];
}

function generateCone(r, h, n = 64){
  const nVertices = n + 2;//number of vertices
  const vertices = new Float32Array(nVertices*3);
  const colors = new Float32Array(nVertices*3);
  const normals = new Float32Array(nVertices*3);
  const indices = new Uint16Array(n*6);

  //generate vertices
  for(let i = 0; i < n; i++){
    const angle = (2*Math.PI*i) / n;
    const offset = i*3;

    vertices[offset + 0] = r*Math.cos(angle);
    vertices[offset + 1] = 0.0;
    vertices[offset + 2] = r*Math.sin(angle);

    //set colors
    for(let j = 0; j < 3; j++){
      colors[offset + j] = 0.5;
    }

    //calculate normals
    let x = -r*Math.cos(angle);
    let y = -r*Math.cos(angle);
    let z = r;

    let m = Math.sqrt(x*x + y*y + z*z);

    normals[offset + 0] = x/m;
    normals[offset + 1] = y/m;
    normals[offset + 2] = z/m;
  }

  //offset of the point vertex
  const pointIndex = n;
  const pointOffset = pointIndex * 3;

  //vertex for the point
  vertices[pointOffset + 0] = 0.0;
  vertices[pointOffset + 1] = h;
  vertices[pointOffset + 2] = 0.0;

  for(let j = 0; j < 3; j++){
    colors[pointOffset + j] = 1.0;
  }

  //normal for the point
  normals[pointOffset + 0] = 0.0;
  normals[pointOffset + 1] = 0.0;
  normals[pointOffset + 2] = 1.0;

  //offset of the base vertex
  const baseIndex = n+1;
  const baseOffset = baseIndex * 3;
  //vertex for the base
  vertices[baseOffset + 0] = 0.0;
  vertices[baseOffset + 1] = 0.0;
  vertices[baseOffset + 2] = 0.0;
  //colors for the base
  for(let j = 0; j < 3; j++){
    colors[baseOffset + j] = 1.0;
  }
  //normal for the base
  normals[baseOffset + 0] = 0.0;
  normals[baseOffset + 1] = 0.0;
  normals[baseOffset + 2] = -1.0;

  //generate indices
  let index = 0;
  for(let i = 0; i < n; i++){
    const nextFace = (i+1) % n;

    //side faces
    indices[index++] = i;
    indices[index++] = nextFace;
    indices[index++] = pointIndex;

    //bottom faces
    indices[index++] = i;
    indices[index++] = nextFace;
    indices[index++] = baseIndex;
  }

  return [vertices, colors, indices, normals];
}

// I learned this method of generating a sphere's vertices and indices from:
// https://learningwebgl.com/blog/?p=1253
function generateSphere(r, n = 64){
  const nVertices = (n + 1) * (n + 1);
  const vertices = new Float32Array(nVertices * 3);
  const colors = new Float32Array(nVertices * 3);
  const normals = new Float32Array(nVertices*3);
  const indices = new Uint16Array(n * n * 6);

  for(let i = 0; i <= n; i++){
    const theta = i*Math.PI / n;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for(let j = 0; j <= n; j++){
      const phi = j*2*Math.PI / n;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi*sinTheta;
      const y = cosTheta;
      const z = sinPhi*sinTheta;

      const offset = (i * (n + 1) + j) * 3;
      vertices[offset + 0] = r * x;
      vertices[offset + 1] = r * y;
      vertices[offset + 2] = r * z;
    
      colors[offset + 0] = 0.5;//(x + 1) / 2;
      colors[offset + 1] = 0.5;//(y + 1) / 2;
      colors[offset + 2] = 0.5;//(z + 1) / 2;

      normals[offset + 0] = x/r;
      normals[offset + 1] = y/r;
      normals[offset + 2] = z/r;
    }
  }

  for(let i = 0; i < n; i++){
    for(let j = 0; j < n; j++){
      let offset = (i * n + j) * 6;
      
      let first = (i*(n+1))+j;
      let second = first+n+1;
      let third = first+1;

      let fourth = second;
      let fifth = second+1;
      let sixth = first+1;

      indices[offset + 0] = first;
      indices[offset + 1] = second;
      indices[offset + 2] = third;
      indices[offset + 3] = fourth;
      indices[offset + 4] = fifth;
      indices[offset + 5] = sixth;
    }
  }
  return [vertices, colors, indices, normals];
}

function generateTorus(R, r, n = 64, m = 32){
  const nVertices = n*m;
  const vertices = new Float32Array(nVertices*3);
  const colors = new Float32Array(nVertices*3);
  const normals = new Float32Array(nVertices*3);
  const indices = new Uint16Array(n*m*6);

  for(let i = 0; i < n; i++){
    for(let j = 0; j < m; j++){
      let theta = (2*Math.PI*i)/n;
      let phi = (2*Math.PI*j)/m;

      let x = (R + r*Math.sin(theta))*Math.cos(phi);
      let y = (R + r*Math.sin(theta))*Math.sin(phi);
      let z = r*Math.cos(theta);

      const offset = (i*m + j)*3;
      vertices[offset + 0] = x;
      vertices[offset + 1] = y;
      vertices[offset + 2] = z;

      //calculate normals
      let tx = -Math.sin(theta);
      let ty = Math.cos(theta);
      let tz = 0;

      let sx = Math.cos(theta)*(-Math.sin(phi));
      let sy = Math.sin(theta)*(-Math.sin(phi));
      let sz = Math.cos(phi);

      let nx = ty*sz - tz*sy;
      let ny = tz*sx - tx*sz;
      let nz = tx*sy - ty*sx;

      let length = Math.sqrt(nx*nx + ny*ny + nz*nz);
      nx/=length;
      ny/=length;
      nz/=length;
      
      normals[offset + 0] = nx;
      normals[offset + 1] = ny;
      normals[offset + 2] = nz;

      //set colors
      colors[offset + 0] = 0.5;//(x / (R + r) + 1) / 2;
      colors[offset + 1] = 0.5;//(y / (R + r) + 1) / 2;
      colors[offset + 2] = 0.5;//(z / r + 1) / 2;

      //generate indices
      const nextI = (i + 1) % n;
      const nextJ = (j + 1) % m;

      const indexOffset = (i*m + j)*6;
      indices[indexOffset + 0] = i*m + j;
      indices[indexOffset + 1] = nextI*m + j;
      indices[indexOffset + 2] = i*m + nextJ;

      indices[indexOffset + 3] = nextI*m + j;
      indices[indexOffset + 4] = nextI*m + nextJ;
      indices[indexOffset + 5] = i*m + nextJ;
    }
  }

  return [vertices, colors, indices, normals];
}

function generateTetrahedron(size){
  nVertices = 4;
  const h = Math.sqrt(2/3) * size; //height
  const a = size/Math.sqrt(3); //length from center to vertex in base

  const vertices = new Float32Array([
    0,    h,    0,
   -a,    0,  size/2,
    a,    0,  size/2,
    0,    0, -size
  ]);

  const colors = new Float32Array(nVertices*3);
  const f = 1/Math.sqrt(3);
  const normals = new Float32Array([
     0,      f,   f,
    -f,     -f,   f,
     f,     -f,   f,
     0,     -f,  -f
  ]);

  const indices = new Uint16Array([
    0,1,2,
    0,2,3,
    0,3,1,
    1,3,2
  ]);

  //generate colors
  for(let i = 0; i < nVertices; i++){
    const offset = i*3;
    colors[offset + 0] = 0.5;
    colors[offset + 1] = 0.5;
    colors[offset + 2] = 0.5;
  }

  return [vertices, colors, indices, normals];
}

//Fishing Rod
rodBase = generateCylinder(0.2, 3.0);
rodArm = generateCylinder(0.1, 10.0);

coreCylinder = generateCylinder(0.5, 1.0);
coreSphere = generateSphere(0.5, 16);

handleBase = generateCylinder(0.1, 0.5);
handleArm = generateCylinder(0.1, 0.5);
handleGrip = generateCylinder(0.1, 0.5);

ring1 = generateTorus(0.2, 0.03);
ring2 = generateTorus(0.2, 0.03);
ring3 = generateTorus(0.2, 0.03);
ring4 = generateTorus(0.2, 0.03);
ring5 = generateTorus(0.2, 0.03);

stringA = generateCylinder(0.01, 2.0);
stringB = generateCylinder(0.01, 8.0);
stringC = generateCylinder(0.01, 1.0);

bobberSphere = generateSphere(0.2);
bobberHead = generateCylinder(0.075, 0.05);
bobberRing = generateTorus(0.2, 0.02);

//Fish
fishBody = generateSphere(0.5);
fishTail = generateCone(1, 1);

//Dock
plank1 = generateCube(1.0);
plank2 = generateCube(1.0);
plank3 = generateCube(1.0);
plank4 = generateCube(1.0);
plank5 = generateCube(1.0);

//River
river = generateCube(1.0);

const objects = [
  coreCylinder,
  coreSphere,
  handleBase,
  handleArm,
  handleGrip,
  rodBase,
  rodArm,
  ring1,
  ring2,
  ring3,
  ring4,
  ring5,
  stringA,
  stringB,
  stringC,
  fishBody,
  fishTail,
  bobberHead,
  bobberSphere,
  bobberRing,
  plank1,
  plank2,
  plank3,
  plank4,
  plank5,
  river
];