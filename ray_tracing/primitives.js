/**
 * Primitive Base Class
 */
class Primitive {
    constructor(shapeType, color, material, reflectivity, refractiveIndex) {
        if (new.target === Primitive) {
            throw new Error("Cannot instantiate abstract class Primitive directly");
        }
        this.shapeType = shapeType;
        switch (shapeType) {
            case "cone":
                this.shapeTypeID = 0;
                break;
            case "cylinder":
                this.shapeTypeID = 1;
                break;
            case "ellipsoid":
                this.shapeTypeID = 2;
                break;
            case "rectprism":
                this.shapeTypeID = 3;
                break;
            case "torus":
                this.shapeTypeID = 4;
                break;
            default:
                this.shapeTypeID = -1;
        }
        this.color = color;
        this.material = material;
        this.reflectivity = reflectivity;
        this.refractiveIndex = refractiveIndex;
    }
}

/**
 * Geometric Primitives
 */

class Cone extends Primitive {
    constructor(color, radius, height, material, reflectivity, refractiveIndex) {
        super("cone", color, material, reflectivity, refractiveIndex);
        this.radius = radius;
        this.height = height;
    }
}

class Cylinder extends Primitive {
    constructor(color, radius, height, material, reflectivity, refractiveIndex) {
        super("cylinder", color, material, reflectivity, refractiveIndex);
        this.radius = radius;
        this.height = height;
    }
}

class Ellipsoid extends Primitive {
    constructor(color, radius, material, reflectivity, refractiveIndex) {
        super("ellipsoid", color, material, reflectivity, refractiveIndex);
        this.radius = radius;
    }
}

class RectPrism extends Primitive {
    constructor(dims, color, material, reflectivity, refractiveIndex) {
        super("rectprism", color, material, reflectivity, refractiveIndex);
        this.dims = dims;
    }
}

class Torus extends Primitive {
    constructor(color, R, r, material, reflectivity, refractiveIndex) {
        super("torus", color, material, reflectivity, refractiveIndex);
        this.R = R;
        this.r = r;
    }
}

window.Primitive = Primitive;
window.RectPrism = RectPrism;
window.Cylinder = Cylinder;
window.Cone = Cone;
window.Ellipsoid = Ellipsoid;
window.Torus = Torus;

function packPrimitive(view, offset, localMatrix, worldMatrix, color, reflectivity, refractiveIndex, shapeType, material) {
    let f32 = new Float32Array(view.buffer);
    let i32 = new Int32Array(view.buffer);

    let base = offset / 4; // float index

    // 1. localMatrix (16 floats)
    f32.set(localMatrix.m, base);
    base += 16;

    // 2. worldMatrix (16 floats)
    f32.set(worldMatrix.m, base);
    base += 16;

    // 3. color (vec3) + reflectivity (float)
    f32[base++] = color.x;
    f32[base++] = color.y;
    f32[base++] = color.z;
    f32[base++] = reflectivity;

    // 4. refractiveIndex
    f32[base++] = refractiveIndex;

    // 5. shapeType (int)
    i32[base++] = shapeType;

    // 6. material (int)
    i32[base++] = material;

    // 7. padding
    i32[base++] = 0; // pad0

    // debug line
    // console.log(f32.slice(offset, offset + 40)); 
}
window.packPrimitive = packPrimitive;