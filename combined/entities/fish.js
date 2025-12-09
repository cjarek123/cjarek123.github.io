/**
 * Fish entity
 */
class Fish extends Entity {

    static SWIMMING = 0;
    static HOOKED = 1;
    static CAUGHT = 2;
    static ESCAPED = 3;

    constructor(color, center, scale_factor) {

        super();
        // initialize the state
        this.state = Fish.SWIMMING;

        // primitives
        let fishBody = new Ellipsoid(color, new Vec3(scale_factor*1.0, scale_factor*0.2, scale_factor*0.5), MATERIALS.DIFFUSE, .0, .0);
        let fishTail = new Cone(color, scale_factor*0.25, scale_factor*0.5, MATERIALS.DIFFUSE, .0, .0);

        // nodes
        this.fishBodyNode = new Node(fishBody);
        this.fishTailNode = new Node(fishTail);

        // attach tail to body
        this.fishTailNode.setParent(this.fishBodyNode);

        // translate fish body
        this.fishBodyNode.localMatrix.translate(center.x, center.y, center.z);

        // translate fish tail
        this.fishTailNode.localMatrix.scale(3.0, 0.8, 1.5);
        this.fishTailNode.localMatrix.rotateY(Math.PI/2);
        this.fishTailNode.localMatrix.translate(1.0 * scale_factor, 0.0, 0.0);

        // update nodes world matrices (need to only call on root nodes)
        this.fishBodyNode.updateWorldMatrix();

        this.nodes = [
            this.fishBodyNode, 
            this.fishTailNode
        ]

    }

    animate(deltaTime) {
    }
}