class PineTree extends Entity {

    constructor(trunkColor, leavesColor, center, scale_factor) {

        super();

        // primitives
        let trunk = new Cylinder(trunkColor, scale_factor*6.0, scale_factor*8.0, MATERIALS.DIFFUSE, 0.0, 0.0)
        let leaves1 = new Cone(leavesColor, scale_factor*12.0, scale_factor*13.0, MATERIALS.DIFFUSE, 0.0, 0.0)
        let leaves2 = new Cone(leavesColor, scale_factor*12.0, scale_factor*13.0, MATERIALS.DIFFUSE, 0.0, 0.0)
        let leaves3 = new Cone(leavesColor, scale_factor*10.0, scale_factor*11.0, MATERIALS.DIFFUSE, 0.0, 0.0)

        // nodes
        this.trunkNode = new Node(trunk);
        this.leaves1Node = new Node(leaves1);
        this.leaves2Node = new Node(leaves2);
        this.leaves3Node = new Node(leaves3);

        // tranformations
        this.leaves1Node.setParent(this.trunkNode)
        this.leaves2Node.setParent(this.leaves1Node)
        this.leaves3Node.setParent(this.leaves2Node)

        // translate trunk
        this.trunkNode.localMatrix.translate(center.x, center.y, center.z);
        this.leaves1Node.localMatrix.translate(0.0,0.0,12.0);
        this.leaves2Node.localMatrix.translate(0.0,0.0,10.0);
        this.leaves3Node.localMatrix.translate(0.0,0.0,8.0);

        // update nodes world matrices (need to only call on root nodes)
        this.trunkNode.updateWorldMatrix();

        this.nodes = [
            this.trunkNode,
            this.leaves1Node,
            this.leaves2Node,
            this.leaves3Node
        ]
        
    }

    animate(deltaTime) {
    }
}