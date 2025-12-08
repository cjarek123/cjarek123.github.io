/**
 * 4 dimensional matrix for transformations
 */
class Matrix4 {
    
    constructor(values) {
        this.m = new Float32Array(16);
        if (values) {
            for (let i = 0; i < 16; i++) this.m[i] = values[i];
        } else {
            this.setIdentity();
        }
    }

    setIdentity() {
        const m = this.m;
        m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
        m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
        return this;
    }

    clone() {
        return new Matrix4(this.m);
    }

    // matrix multiplication

    static multiply(A, B) {
        const out = new Float32Array(16);
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += A.m[row + k*4] * B.m[k + col*4];
                }
                out[row + col*4] = sum;
            }
        }

        return new Matrix4(out);
    }

    preMultiply(other) {
        const a = this.m;    // this matrix
        const b = other.m;   // the matrix to apply first
        const out = new Float32Array(16);

        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    // swap order: b * a instead of a * b
                    sum += b[row + k*4] * a[k + col*4];
                }
                out[row + col*4] = sum;
            }
        }

        this.m = out;
        return this;
    }

    postMultiply(other) {
        const a = this.m;
        const b = other.m;
        const out = new Float32Array(16);

        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[row + k*4] * b[k + col*4];
                }
                out[row + col*4] = sum;
            }
        }

        this.m = out;
        return this;
    }

    // translate

    translate(x, y, z) {
        const t = new Matrix4();
        t.m[12] = x;
        t.m[13] = y;
        t.m[14] = z;
        return this.preMultiply(t);
    }

    // scale

    scale(x, y, z) {
        const s = new Matrix4();
        s.m[0] = x;
        s.m[5] = y;
        s.m[10] = z;
        return this.preMultiply(s);
    }

    // Rotation: angle in radians

    rotateX(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const r = new Matrix4();
        r.m[5] = c;
        r.m[6] = s;
        r.m[9] = -s;
        r.m[10] = c;
        return this.preMultiply(r);
    }

    rotateY(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const r = new Matrix4();
        r.m[0] = c;
        r.m[2] = -s;
        r.m[8] = s;
        r.m[10] = c;
        return this.preMultiply(r);
    }

    rotateZ(rad) {
        const c = Math.cos(rad); 
        const s = Math.sin(rad);
        const r = new Matrix4();
        r.m[0] = c;
        r.m[1] = s;
        r.m[4] = -s;
        r.m[5] = c;
        return this.preMultiply(r);
    }

    // transformation apply

    transformVec3(v) {
        const m = this.m;
        const x = v[0], y = v[1], z = v[2];

        return [
            m[0] * x + m[4] * y + m[8]  * z + m[12],
            m[1] * x + m[5] * y + m[9]  * z + m[13],
            m[2] * x + m[6] * y + m[10] * z + m[14]
        ];
    }
}
window.Matrix4 = Matrix4;