function initMyBuffers(objects){
    const myBuffers = [];

    objects.forEach(object => {
        const positions = object[0];
        const colors = object[1];
        const indices = object[2];
        const normals = object[3];

        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
        let nbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        myBuffers.push([vbo, nbo, ibo, indices.length, positions, normalBuffer]);
        });
    return myBuffers;
}


class Node{
    constructor(buffer){
        this.buffer = buffer;// [vbo, nbo, ibo, indexLength, vertices]
        this.children = [];
        this.parent = null;
        this.localMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this.worldMatrix = new Float32Array(this.localMatrix);
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
        if(parentWorldMatrix){
            this.worldMatrix = myMultiplyM4(parentWorldMatrix, this.localMatrix);
        }else{
            this.worldMatrix = new Float32Array(this.localMatrix);
        }

        let worldMatrix = this.worldMatrix;
        this.children.forEach(child =>{
            child.updateWorldMatrix(worldMatrix);
        });
    }
}

function bindMyBuffers(buffers, deltaTime, x, y, a, grab, modelViewMatrix, modelTransformationMatrix){
    const baseNode = new Node(buffers[0]);
    const arm1Node = new Node(buffers[1]);
    const arm2Node = new Node(buffers[2]);
    const handNode = new Node(buffers[3]);
    const finger1Node = new Node(buffers[4]);
    const finger2Node = new Node(buffers[5]);
    const finger3Node = new Node(buffers[6]);
    const testCubeNode = new Node(buffers[7]);
    let nodes = [baseNode, arm1Node, arm2Node, handNode, finger1Node, finger2Node, finger3Node, testCubeNode];

    finger3Node.setParent(handNode);
    finger2Node.setParent(handNode);
    finger1Node.setParent(handNode);
    handNode.setParent(arm2Node);
    arm2Node.setParent(arm1Node);
    arm1Node.setParent(baseNode);

    testCubeNode.localMatrix = myScale(100, 0.1, 100, testCubeNode.localMatrix);
    testCubeNode.localMatrix = myTranslate(0, 0, -3, testCubeNode.localMatrix);
    testCubeNode.updateWorldMatrix();

    //Mathematics for inverse kinematics learned from:
    //https://robotacademy.net.au/lesson/inverse-kinematics-for-a-2-joint-robot-arm-using-geometry/
    sum1 = x*x + y*y - 5*5 - 4*4;
    sum2 = 2*5*4;
    const q2 = -Math.acos((sum1)/(sum2));

    sum3 = 4*Math.sin(q2);
    sum4 = 5+4*Math.cos(q2);
    const q1 = Math.atan(y/x) + Math.atan(sum3/sum4);

    //baseNode.localMatrix = myRotateY(deltaTime*0.001, baseNode.localMatrix);
    baseNode.localMatrix = myMultiplyM4(modelTransformationMatrix, baseNode.localMatrix);
    baseNode.localMatrix = myRotateY(Math.PI/2, baseNode.localMatrix);

    //Arm1 Transformations
    arm1Node.localMatrix = myRotateX(Math.PI/8, arm1Node.localMatrix);
    arm1Node.localMatrix = myRotateX(q1, arm1Node.localMatrix);
    arm1Node.localMatrix = myRotateY(a, arm1Node.localMatrix);

    //Arm2 Transformations
    arm2Node.localMatrix = myRotateX(Math.PI/4, arm2Node.localMatrix);
    arm2Node.localMatrix = myRotateX(q2, arm2Node.localMatrix);
    arm2Node.localMatrix = myTranslate(0, 5, 0, arm2Node.localMatrix);
    

    //Hand Transformations
    handNode.localMatrix = myTranslate(0, 4.5, 0, handNode.localMatrix);

    //Finger Transformations
    if(grab > 0.0){
        let theta = (Math.PI/8)*(1-Math.cos(grab));
        finger1Node.localMatrix = myRotateY(theta, finger1Node.localMatrix);
        finger2Node.localMatrix = myRotateX(theta, finger2Node.localMatrix);
        finger3Node.localMatrix = myRotateX(theta, finger3Node.localMatrix);
        grab -= 0.01*deltaTime;
    }
    

    const r = 0.6;
    const theta1 = Math.PI/4, theta2 = -Math.PI/4;
    const phi1 = 0, phi2 = Math.PI/6, phi3 = -Math.PI/6;

    const x1 = Math.cos(Math.PI/2);
    const y1 = Math.sin(Math.PI/2);
    const z1 = 0;

    const x2 = Math.cos(Math.PI*7/6);
    const y2 = Math.sin(Math.PI*7/6);
    const z2 = 0;

    const x3 = Math.cos(Math.PI*11/6)
    const y3 = Math.sin(Math.PI*11/6)
    const z3 = 0;

    finger1Node.localMatrix = myTranslate(r*y1, r*z1, r*x1, finger1Node.localMatrix);
    finger2Node.localMatrix = myTranslate(r*y2, r*z2, r*x2, finger2Node.localMatrix);
    finger3Node.localMatrix = myTranslate(r*y3, r*z3, r*x3, finger3Node.localMatrix);

    baseNode.updateWorldMatrix();

    for(let i = 0; i < nodes.length; i++){
        let node = nodes[i];
        const vbo = node.buffer[0];
        const nbo = node.buffer[1];
        const ibo = node.buffer[2];
        const indexLength = node.buffer[3];
        const vertices = node.buffer[4];
        const normals = node.buffer[5]

        if(typeof uMTM !== 'undefined' && node.worldMatrix){
            const finalMatrix = myMultiplyM4(modelViewMatrix, node.worldMatrix);
            gl.uniformMatrix4fv(uMTM, false, finalMatrix);
        }

        //binding position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        //binding color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

        //binding index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

        //binding normals buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, normals);
        gl.enableVertexAttribArray(normalLoc);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);

        //drawing the object
        gl.drawElements(gl.TRIANGLES, indexLength, gl.UNSIGNED_SHORT, 0);
    }
}