function myMultiplyM4xVert(vertices, matrix){
    const len = vertices.length;
    const result = new Float32Array(len);

    const a = matrix[0], b = matrix[4], c = matrix[8], d = matrix[12];
    const e = matrix[1], f = matrix[5], g = matrix[9], h = matrix[13];
    const i = matrix[2], j = matrix[6], k = matrix[10], l = matrix[14];
    const m = matrix[3], n = matrix[7], o = matrix[11], p = matrix[15];

    for(let idx = 0; idx < len; idx += 3){
        const x = vertices[idx + 0];
        const y = vertices[idx + 1];
        const z = vertices[idx + 2];

        let rx = a*x + b*y + c*z + d;
        let ry = e*x + f*y + g*z + h;
        let rz = i*x + j*y + k*z + l;
        let w  = m*x + n*y + o*z + p;

        if(w !== 1 && w !== 0){
            rx /= w;
            ry /= w;
            rz /= w;
        }

        result[idx + 0] = rx;
        result[idx + 1] = ry;
        result[idx + 2] = rz;
        
    }
    return result;
}

function myMultiplyM4(a, b){
    const result = new Float32Array(16);
    for(let row = 0; row < 4; row++){
        for(let col = 0; col < 4; col++){
            let sum = 0.0;
            for(let i = 0; i < 4; i++){
                sum += a[i*4+row] * b[col*4+i];
            }
            result[col*4 + row] = sum;
        }
    }
    return result;
}

function myTranslate(dx, dy, dz, localMatrix){
    const matrix = new Float32Array([
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        dx, dy, dz, 1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

function myScale(sx, sy, sz, localMatrix){
        const matrix = new Float32Array([
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

function myShearX(sy, sz, localMatrix){
        const matrix = new Float32Array([
        1,  0,  0,  0,
        sy, 1,  0,  0,
        sz, 0,  1,  0,
        0,  0,  0,  1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

function myShearY(sx, sz, localMatrix){
        const matrix = new Float32Array([
        1,  sx,  sz, 0,
        0,  1,   0,  0,
        0,  0,   1,  0,
        0,  0,   0,  1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

function myShearZ(sx, sy, sz, localMatrix){
        const matrix = new Float32Array([
        1,  0,  sx,  0,
        0,  1,  sy,  0,
        0,  0,  1,   0,
        0,  0,  0,   1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

function myRotateX(a, localMatrix){
    const c = Math.cos(a);
    const s = Math.sin(a);

        const matrix = new Float32Array([
        1, 0, 0, 0,
        0, c, s, 0,
        0,-s, c, 0,
        0, 0, 0, 1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

function myRotateY(a, localMatrix){
    const c = Math.cos(a);
    const s = Math.sin(a);

        const matrix = new Float32Array([
        c, 0,-s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

function myRotateZ(a, localMatrix){
    const c = Math.cos(a);
    const s = Math.sin(a);

        const matrix = new Float32Array([
        c, s, 0, 0,
       -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

    return myMultiplyM4(matrix, localMatrix);
}

const T = myTranslate(1,2,3, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
console.log(T[12], T[13], T[14]); // should print: 1 2 3
console.log("test")