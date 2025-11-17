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
    
      colors[offset + 0] = (x + 1) / 2;
      colors[offset + 1] = (y + 1) / 2;
      colors[offset + 2] = (z + 1) / 2;

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

base = generateCylinder(3, 0.5);
arm1 = generateCylinder(0.5, 5);
arm2 = generateCylinder(0.5, 4);
hand = generateSphere(0.5);
finger1 = generateCone(0.2, 1);
finger2 = generateCone(0.2, 1);
finger3 = generateCone(0.2, 1);
testCube = generateCube(2);

const objects = [base, arm1, arm2, hand, finger1, finger2, finger3, testCube];