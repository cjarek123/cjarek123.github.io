/**
 * Dock entity
 */
class Dock extends Entity {

    constructor(color, center, scale_factor) {

        super();

        // primitives
        let plank1 = new RectPrism(color, new Vec3(scale_factor*25.0, scale_factor*8.0, scale_factor*5.0), MATERIALS.DIFFUSE, 0.0, 0.0);
        let plank2 = new RectPrism(color, new Vec3(scale_factor*25.0, scale_factor*8.0, scale_factor*5.0), MATERIALS.DIFFUSE, 0.0, 0.0);
        let plank3 = new RectPrism(color, new Vec3(scale_factor*25.0, scale_factor*8.0, scale_factor*5.0), MATERIALS.DIFFUSE, 0.0, 0.0);

        // nodes
        this.plank1Node = new Node(plank1);
        this.plank2Node = new Node(plank2);
        this.plank3Node = new Node(plank3);

        // build tree
        this.plank2Node.setParent(this.plank1Node);
        this.plank3Node.setParent(this.plank1Node);

        // tranformations

        // translate center plank
        this.plank1Node.localMatrix.translate(center.x, center.y, center.z);
        this.plank2Node.localMatrix.translate(0.0, -9.0, 0.0);
        this.plank3Node.localMatrix.translate(0.0, 9.0, 0.0);

        // update nodes world matrices (need to only call on root nodes)
        this.plank1Node.updateWorldMatrix();

        this.nodes = [
            this.plank1Node, 
            this.plank2Node, 
            this.plank3Node
        ]
        
    }

    animate(deltaTime) {
    }
}