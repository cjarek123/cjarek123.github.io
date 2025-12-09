class Node{

    constructor(primitive){
        this.primitive = primitive; // primitive
        this.parent = null; // point to Node
        this.children = []; // point to Nodes
        this.localMatrix = new Matrix4(); // identity
        this.worldMatrix = this.localMatrix.clone();
    }

    setParent(parent){
        //if a parent already exists, remove this from its list of children
        if(this.parent){
            let ndx = this.parent.children.indexOf(this);
            if(ndx >= 0){
                this.parent.children.splice(ndx, 1);
            }
        }
        //add this to the new parent's list of children
        if(parent){
            parent.children.push(this);
        }
        this.parent = parent;
    }

    updateWorldMatrix(parentWorldMatrix = null){
        if (parentWorldMatrix) {
            this.worldMatrix = Matrix4.multiply(parentWorldMatrix, this.localMatrix);
        } else {
            this.worldMatrix = this.localMatrix.clone();
        }

        let worldMatrix = this.worldMatrix;
        this.children.forEach(child =>{
            child.updateWorldMatrix(worldMatrix);
        });
    }
}
window.Node = Node;