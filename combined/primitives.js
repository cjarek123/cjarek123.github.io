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
    constructor(color, dims, material, reflectivity, refractiveIndex) {
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

/**
 * Packs the data from a node/primitive into a struct for the UBO
 */
function packPrimitive(view, offset, node) { // size was 176 now?
    
    // extract the data
    const primitive = node.primitive;
    const worldMatrix = node.worldMatrix;
    const color = primitive.color;
    const reflectivity = primitive.reflectivity;
    const refractiveIndex = primitive.refractiveIndex;
    const material = primitive.material;
    const shapeTypeID = primitive.shapeTypeID;

    let f32 = new Float32Array(view.buffer);
    let i32 = new Int32Array(view.buffer);

    let base = offset / 4; // float index

    // worldMatrix (16 floats)
    f32.set(worldMatrix.m, base);
    base += 16;

    // color (vec3) + reflectivity (float) (4 floats)
    f32[base++] = color.x;
    f32[base++] = color.y;
    f32[base++] = color.z;
    f32[base++] = reflectivity;

    // refractiveIndex (float), material (int), shapeType(int), padding(int) (4 data)
    f32[base++] = refractiveIndex;
    i32[base++] = material;
    i32[base++] = shapeTypeID;
    i32[base++] = 0; // pad0

    let field1, field2, field3;
    switch(shapeTypeID) {
        case 0: // cone
            field1 = primitive.radius;
            field2 = primitive.height;
            field3 = 0;
            break;
        case 1: // cylinder
            field1 = primitive.radius;
            field2 = primitive.height;
            field3 = 0;
            break;
        case 2: // ellipsoid
            field1 = primitive.radius.x;
            field2 = primitive.radius.y;
            field3 = primitive.radius.z;
            break;
        case 3: // rectprism
            field1 = primitive.dims.x;
            field2 = primitive.dims.y;
            field3 = primitive.dims.z;
            break;
        case 4: // torus
            field1 = primitive.R;
            field2 = primitive.r;
            field3 = 0;
            break;
        default:
            field1 = -1;
            field2 = -1;
            field3 = -1;
    }

    // shape math fields (4 data)
    f32[base++] = field1;
    f32[base++] = field2;
    f32[base++] = field3;
    i32[base++] = 0; // pad1

    // debug line
    // console.log(f32.slice(offset / 4, offset / 4 + 28));
}
window.packPrimitive = packPrimitive;