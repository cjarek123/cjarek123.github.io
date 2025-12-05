/**
 * Primitive Base Class
 */
class Primitive {
    constructor(shape_type, color, material, reflectivity, refractiveIndex) {
        if (new.target === Primitive) {
            throw new Error("Cannot instantiate abstract class Primitive directly");
        }
        this.color = color;
        this.shape_type = shape_type;
        this.material = material;
        this.reflectivity = reflectivity;
        this.refractiveIndex = refractiveIndex;
    }
}

/**
 * Geometric Primitives
 */

class Cube extends Primitive {
    constructor(dims, color, material, reflectivity, refractiveIndex) {
        super("cube", color, material, reflectivity, refractiveIndex);
        this.dims = dims;
    }
}

class Cylinder extends Primitive {
    constructor(color, radius, height, material, reflectivity, refractiveIndex) {
        super("cylinder", color, material, reflectivity, refractiveIndex);
        this.radius = radius;
        this.height = height;
    }
}

class Cone extends Primitive {
    constructor(color, radius, height, material, reflectivity, refractiveIndex) {
        super("cone", color, material, reflectivity, refractiveIndex);
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

class Torus extends Primitive {
    constructor(color, R, r, material, reflectivity, refractiveIndex) {
        super("sphere", color, material, reflectivity, refractiveIndex);
        this.R = R;
        this.r = r;
    }
}

window.Primitive = Primitive;
window.Cube = Cube;
window.Cylinder = Cylinder;
window.Cone = Cone;
window.Ellipsoid = Ellipsoid;
window.Torus = Torus;