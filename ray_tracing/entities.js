//Fishing Rod
// let rodBase = new Cylinder(0.2, 3.0, MATERIALS.DIFFUSE, 0.0, 0.0);
// let rodArm = new Cylinder(0.1, 10.0, MATERIALS.DIFFUSE, 0.0, 0.0);

// let = coreCylinder = generateCylinder(0.5, 1.0);
// let = coreSphere = generateSphere(0.5, 16);

// let = handleBase = generateCylinder(0.1, 0.5);
// let = handleArm = generateCylinder(0.1, 0.5);
// let = handleGrip = generateCylinder(0.1, 0.5);

// let = ring1 = generateTorus(0.2, 0.03);
// let = ring2 = generateTorus(0.2, 0.03);
// let = ring3 = generateTorus(0.2, 0.03);
// let = ring4 = generateTorus(0.2, 0.03);
// let = ring5 = generateTorus(0.2, 0.03);

// let = stringA = generateCylinder(0.01, 2.0);
// let = stringB = generateCylinder(0.01, 8.0);
// let = stringC = generateCylinder(0.01, 1.0);

// let = bobberSphere = generateSphere(0.2);
// let = bobberHead = generateCylinder(0.075, 0.05);
// let = bobberRing = generateTorus(0.2, 0.02);

// //Dock
// let = plank1 = generateCube(1.0);
// let = plank2 = generateCube(1.0);
// let = plank3 = generateCube(1.0);
// let = plank4 = generateCube(1.0);
// let = plank5 = generateCube(1.0);

// //River
// let = river = generateCube(1.0);

/**
 * Stores the entities of the game
 */
class Entities {
    constructor() {
        this.entities = []
    }

    addEntity(entity) {
        this.entities.push(entity)
    }

    /**
     * update the animations of all entity
     */
    animate(deltaTime) {
        for (const entity of this.entities) {
            entity.animate(deltaTime)
        }
    }
}

/**
 * Entity Base Class
 */
class Entity {
    constructor() {
        if (new.target === Entity) {
            throw new Error("Cannot instantiate abstract class Entity directly");
        }
    }

    animate(deltaTime) {
        throw new Error("Entity.animate(deltaTime) must be implemented by subclass");
    }
}

/**
 * Fish entity
 */
class Fish extends Entity {
    constructor(color) {
        super();
        // primitives
        let fishBody = new Ellipsoid(color, new Vec3(1.0, 0.5, 0.3), MATERIALS.DIFFUSE, .0, .0);
        let fishTail = new Cone(color, 0.25, 0.5, MATERIALS.DIFFUSE, .0, .0);
        // nodes
        this.fishBodyNode = new Node(fishBody);
        this.fishTailNode = new Node(fishTail);
        // attach tail to body
        this.fishTailNode.setParent(this.fishBodyNode);
        // translate fish tail
        this.fishTailNode.localMatrix.translate(0, 1.0, 0);
        this.fishBodyNode.updateWorldMatrix();
        this.nodes = [
            this.fishBodyNode, 
            this.fishTailNode
        ]
    }

    animate(deltaTime) {
        // // fish tail flapping
        // this.fishTailNode.localMatrix = this.fishTailNode.localMatrix.rotateY(0.5*Math.sin(deltaTime*0.01));
        // this.fishTailNode.localMatrix = this.fishTailNode.localMatrix.translate(-0.8, 0.0, 0.5*Math.sin(deltaTime*0.01));
        // this.fishBodyNode.updateWorldMatrix();
    }
}

class TestEntity extends Entity {
    constructor(color) {
        super();
        // primitives
        let cone = new Cone(color, 0.25, 0.5, MATERIALS.DIFFUSE, .0, .0);
        let cylinder = new Cylinder(color, 0.25, 0.5, MATERIALS.DIFFUSE, .0, .0);
        let ellipsoid = new Ellipsoid(color, new Vec3(0.5, 1.0, 0.3), MATERIALS.DIFFUSE, 1.0, .0);
        let rectprism = new RectPrism(color, new Vec3(0.5, 0.5, 0.5), MATERIALS.DIFFUSE, .0, .0);
        let torus = new Torus(color, 0.4, 0.15, MATERIALS.DIFFUSE, .0, .0);
        let rectprism2 = new RectPrism(color, new Vec3(10.0, 10.0, 0.5), MATERIALS.DIFFUSE, .0, .0);
        // nodes
        this.coneNode = new Node(cone);
        this.cylinderNode = new Node(cylinder);
        this.ellipsoidNode = new Node(ellipsoid);
        this.rectprismNode = new Node(rectprism);
        this.torusNode = new Node(torus);
        this.rectprismNode2 = new Node(rectprism2);

        // transformations

        this.coneNode.localMatrix.rotateX(-Math.PI/2);
        this.coneNode.localMatrix.translate(0.0, 1.6, 1.6);

        this.cylinderNode.localMatrix.rotateX(Math.PI/2);
        this.cylinderNode.localMatrix.translate(0.0, -1.6, -1.0);
        
        this.ellipsoidNode.localMatrix.rotateY(Math.PI/2);
        this.ellipsoidNode.localMatrix.translate(0.0, 0.0, -1.0);

        this.rectprismNode.localMatrix.rotateZ(Math.PI/4);
        this.rectprismNode.localMatrix.translate(0.0, 1.6, -1.0);

        this.torusNode.localMatrix.rotateY(Math.PI/4);
        this.torusNode.localMatrix.translate(0.0, -1.6, 1.6);

        this.rectprismNode2.localMatrix.translate(0.0, 0.0, -2.5);
        
        // nodes
        this.nodes = [
            this.coneNode, 
            this.cylinderNode,
            this.ellipsoidNode, 
            this.rectprismNode,
            this.torusNode,
            this.rectprismNode2
        ]
    }

    animate(deltaTime) {
        
    }
}