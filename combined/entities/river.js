class River extends Entity {

    constructor(waterColor, dirtColor, center, scale_factor) {

        super();

        // primitives
        let river = new RectPrism(waterColor, new Vec3(scale_factor*400.0, scale_factor*160.0, scale_factor*3.0), MATERIALS.REFRACTIVE, 0.0, 1.5);
        let riverBed = new RectPrism(dirtColor, new Vec3(scale_factor*400.0, scale_factor*160.0, scale_factor*1.0), MATERIALS.DIFFUSE, 0.0, 0.33);

        // nodes
        this.riverNode = new Node(river);
        this.riverBedNode = new Node(riverBed);

        // tranformations
        this.riverBedNode.setParent(this.riverNode)

        // translate river
        this.riverNode.localMatrix.translate(center.x, center.y, center.z);
        this.riverBedNode.localMatrix.translate(0.0, 0.0, -3.0);

        // update nodes world matrices (need to only call on root nodes)
        this.riverNode.updateWorldMatrix();

        this.nodes = [
            this.riverNode,
            this.riverBedNode
        ]
        
    }

    animate(deltaTime) {
    }
}