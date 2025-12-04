/**
 * 3 dimensional vector
 */
class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    dot(v) {
        return this.x*v.x + this.y*v.y + this.z*v.z;
    }

    cross(v) {
        return new Vec3(
        this.y*v.z - this.z*v.y,
        this.z*v.x - this.x*v.z,
        this.x*v.y - this.y*v.x
        );
    }

    normalize() {
        const len = Math.hypot(this.x, this.y, this.z) || 1;
        return new Vec3(this.x/len, this.y/len, this.z/len);
    }
}
window.Vec3 = Vec3;