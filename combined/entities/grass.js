class Grass extends Entity {

    constructor(color, center, scale_factor) {

        super();

        // primitives
        let grass = new RectPrism(color, new Vec3(scale_factor*400.0, scale_factor*100.0, scale_factor*4.0), MATERIALS.DIFFUSE, 0.0, 0.0);

        // nodes
        this.grassNode = new Node(grass);

        // tranformations

        // translate grass block
        this.grassNode.localMatrix.translate(center.x, center.y, center.z);

        // update nodes world matrices (need to only call on root nodes)
        this.grassNode.updateWorldMatrix();

        this.nodes = [
            this.grassNode
        ]
        
    }

    animate(deltaTime) {
    }
}