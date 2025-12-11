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

const fishes = [];

function bindMyBuffers(buffers, deltaTime, x, y, a, grab, modelViewMatrix, modelTransformationMatrix){
    //Fishing Rod
    const coreCylinder = new Node(buffers[0]);
    const coreSphere = new Node(buffers[1]);
    const handleBase = new Node(buffers[2]);
    const handleArm = new Node(buffers[3]);
    const handleGrip = new Node(buffers[4]);
    const rodBase = new Node(buffers[5]);
    const rodArm = new Node(buffers[6]);
    const ring1 = new Node(buffers[7]);
    const ring2 = new Node(buffers[8]);
    const ring3 = new Node(buffers[9]);
    const ring4 = new Node(buffers[10]);
    const ring5 = new Node(buffers[11]);
    const stringA = new Node(buffers[12]);
    const stringB = new Node(buffers[13]);
    const stringC = new Node(buffers[14]);
    const bobberHead = new Node(buffers[17]);
    const bobberSphere = new Node(buffers[18]);
    const bobberRing = new Node(buffers[19]);

    //Dock
    const plank1 = new Node(buffers[20]);
    const plank2 = new Node(buffers[21]);
    const plank3 = new Node(buffers[22]);
    const plank4 = new Node(buffers[23]);
    const plank5 = new Node(buffers[24]);

    //River
    const river = new Node(buffers[25]);

    const nodes = [
        coreCylinder,
        coreSphere,
        handleBase,
        handleArm,
        handleGrip,
        rodBase,
        rodArm,
        ring1,
        ring2,
        ring3,
        ring4,
        ring5,
        stringA,
        stringB,
        stringC,
        bobberHead,
        bobberSphere,
        bobberRing,
        plank1,
        plank2,
        plank3,
        plank4,
        plank5,
        river
    ];

    //FISH
    let numberOfFish = 6;
    if(fishes.length < numberOfFish){    
        for(i = fishes.length; i < numberOfFish; i++){
            const newFish = new fish();
            const fishBody = new Node(buffers[15]);
            const fishTail = new Node(buffers[16]);
            fishTail.setParent(fishBody);
            fishes.push({fish: newFish, body:fishBody, tail:fishTail});
        }
    }

    for(i = 0; i < fishes.length; i++){
        let fishData = fishes[i].fish;
        let fishBody = fishes[i].body;
        let fishTail = fishes[i].tail;

        fishData.update(rod);
        fishBody.localMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        fishTail.localMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        
        if(fishData.state == fish.HOOKED){
            rod.fishHooked = true;
            rod.hookedFishWeight = (fishData.size+0.5)*(fishData.size+0.5)*(fishData.size+0.5)*10.0;
            fishBody.setParent(bobberSphere);
            fishData.x = 0.0;
            fishData.y = 0.0;
            fishData.z = 0.0;
        }else{
            fishBody.setParent(null);
        }

        //Fish Body
        fishBody.localMatrix = myScale(2.0, 1.0, 0.6, fishBody.localMatrix);
        fishBody.localMatrix = myScale(fishData.size, fishData.size, fishData.size, fishBody.localMatrix);
        fishBody.localMatrix = myTranslate(fishData.x, fishData.y, fishData.z, fishBody.localMatrix);
        //fishBody.localMatrix = myRotateY(deltaTime*0.001, fishBody.localMatrix);
        //Fish Tail
        fishTail.localMatrix = myRotateZ(-Math.PI/2, fishTail.localMatrix);
        fishTail.localMatrix = myScale(0.5, 1.0, 1/0.6, fishTail.localMatrix);
        fishTail.localMatrix = myScale(1.0, 1.0, 0.05, fishTail.localMatrix);
        fishTail.localMatrix = myRotateY(0.5*Math.sin(deltaTime*0.01), fishTail.localMatrix);
        fishTail.localMatrix = myTranslate(-0.8, 0.0, 0.5*Math.sin(deltaTime*0.01), fishTail.localMatrix);
        
        fishBody.updateWorldMatrix();
        nodes.push(fishBody);
        nodes.push(fishTail);
    }

    //RIVER
    river.localMatrix = myScale(100.0, 0.1, 50.0, river.localMatrix);
    river.localMatrix = myTranslate(0, 0, -10, river.localMatrix);
    river.updateWorldMatrix();

    //DOCK
    plank5.setParent(plank4);
    plank4.setParent(plank3);
    plank3.setParent(plank2);
    plank2.setParent(plank1);

    plank1.localMatrix = myScale(8.0, 0.5, 1.0, plank1.localMatrix);
    plank1.localMatrix = myTranslate(0, 0.5, 3, plank1.localMatrix);
    plank2.localMatrix = myTranslate(0, 0, -1.2, plank2.localMatrix);
    plank3.localMatrix = myTranslate(0, 0, -1.2, plank3.localMatrix);
    plank4.localMatrix = myTranslate(0, 0, -1.2, plank4.localMatrix);
    plank5.localMatrix = myTranslate(0, 0, -1.2, plank5.localMatrix);

    plank1.updateWorldMatrix();

    //FISHING ROD
    handleGrip.setParent(handleArm);
    handleArm.setParent(handleBase);
    stringA.setParent(coreSphere);
    stringB.setParent(stringA);
    stringC.setParent(stringB);
    coreSphere.setParent(coreCylinder);
    handleBase.setParent(coreCylinder);
    ring1.setParent(rodArm);
    ring2.setParent(rodArm);
    ring3.setParent(rodArm);
    ring4.setParent(rodArm);
    ring5.setParent(rodArm);
    coreCylinder.setParent(rodBase);
    rodArm.setParent(rodBase);    
    bobberHead.setParent(stringB);
    bobberSphere.setParent(bobberHead);
    bobberRing.setParent(bobberSphere);

    //Rod Base/Arm
    if(rod.state == fishingRod.CHARGING){
        rodBase.localMatrix = myRotateX(rod.charge*Math.PI/2, rodBase.localMatrix);
    }
    rodBase.localMatrix = myRotateY(Math.PI/16, rodBase.localMatrix);
    rodBase.localMatrix = myTranslate(3, 0, 0, rodBase.localMatrix);

    rodArm.localMatrix = myTranslate(0, 3.0, 0, rodArm.localMatrix);

    //Rings
    ring1.localMatrix = myRotateX(Math.PI/2, ring1.localMatrix);
    ring2.localMatrix = myRotateX(Math.PI/2, ring2.localMatrix);
    ring3.localMatrix = myRotateX(Math.PI/2, ring3.localMatrix);
    ring4.localMatrix = myRotateX(Math.PI/2, ring4.localMatrix);
    ring5.localMatrix = myRotateX(Math.PI/2, ring5.localMatrix);

    ring1.localMatrix = myTranslate(0, 2.0, -0.2, ring1.localMatrix);
    ring2.localMatrix = myTranslate(0, 4.0, -0.2, ring2.localMatrix);
    ring3.localMatrix = myTranslate(0, 6.0, -0.2, ring3.localMatrix);
    ring4.localMatrix = myTranslate(0, 8.0, -0.2, ring4.localMatrix);
    ring5.localMatrix = myTranslate(0, 10.0, -0.2, ring5.localMatrix);

    //Strings
    stringA.localMatrix = myRotateX(Math.PI/15, stringA.localMatrix);
    stringA.localMatrix = myTranslate(0, 0.5, 0, stringA.localMatrix);

    stringB.localMatrix = myRotateX(-Math.PI/15, stringB.localMatrix);
    stringB.localMatrix = myTranslate(0, 2.0, 0, stringB.localMatrix);

    //SCALE Y COMPONENT OF STRING C TO MODIFY LENGTH
    let strLen = Math.sqrt(rod.bobberX*rod.bobberX + rod.bobberY*rod.bobberY + rod.bobberZ*rod.bobberZ);
    let strRotX = Math.atan2(rod.bobberZ, rod.bobberY);
    
    stringC.localMatrix = myScale(1.0, strLen, 1.0, stringC.localMatrix);
    stringC.localMatrix = myRotateX(strRotX, stringC.localMatrix);
    stringC.localMatrix = myTranslate(0, 8.0, 0, stringC.localMatrix);

    //Bobber
    bobberHead.localMatrix = myTranslate(rod.bobberX, 8.2+rod.bobberY, rod.bobberZ, bobberHead.localMatrix);
    bobberSphere.localMatrix = myTranslate(0, -0.2, 0, bobberSphere.localMatrix);
    bobberRing.localMatrix = myRotateX(Math.PI/2, bobberRing.localMatrix);

    //Core Cylinder
    coreCylinder.localMatrix = myTranslate(0, 1.5, -0.7, coreCylinder.localMatrix);

    //Core Sphere
    coreSphere.localMatrix = myTranslate(0, 1.0, 0, coreSphere.localMatrix);

    //Handle Base/Arm/Grip
    handleBase.localMatrix = myRotateZ(Math.PI/2, handleBase.localMatrix);
    if(rod.state == fishingRod.REELING){
        //USE handleBase.localMatrix = myRotateX() TO ANIMATE THE HANDLE SPINNING
        handleBase.localMatrix = myRotateX(-deltaTime*0.01/Math.PI, handleBase.localMatrix);
    }
    handleBase.localMatrix = myTranslate(-0.5, 0.5, 0, handleBase.localMatrix);

    handleArm.localMatrix = myRotateZ(Math.PI/2, handleArm.localMatrix);
    handleArm.localMatrix = myTranslate(0, 0.45, 0, handleArm.localMatrix);

    handleGrip.localMatrix = myRotateZ(-Math.PI/2, handleGrip.localMatrix);
    handleGrip.localMatrix = myTranslate(0.0, 0.45, 0, handleGrip.localMatrix);

    rodBase.updateWorldMatrix();

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