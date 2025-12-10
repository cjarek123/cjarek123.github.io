/**
 * Fishing rod entity
 */
class FishingRod extends Entity {

    static IDLE = 0;
    static CHARGING = 1;
    static RELEASING = 2;
    static FISHING = 3;
    static REELING = 4;
    static REELSPEED = 0.2;

    fishHooked = false;
    hookedFishWeight = 0.0;

    constructor(color, center, scale_factor) {

        super();

        // animation vars
        this.charge = 0.0;
        this.state = FishingRod.IDLE;
        this.bobberX = 0.0;
        this.bobberY = 0.0;
        this.bobberZ = 0.0;
        this.launchSpdX = 0.0;
        this.launchSpdY = 10.0;
        this.launchSpdZ = -10.0;
        this.g = -10.0;
        this.startTime = 0.0;
        this.center = center;

        // primitives
        let rodBase = new Cylinder(color, scale_factor*0.2, scale_factor*3.0, MATERIALS.DIFFUSE, 0.0, 0.0);
        let rodArm = new Cylinder(color, scale_factor*0.1, scale_factor*10.0, MATERIALS.DIFFUSE, 0.0, 0.0);
        let coreCylinder = new Cylinder(color, scale_factor*0.5, scale_factor*1.0, MATERIALS.DIFFUSE, 0.0, 0.0);
        let coreSphere = new Ellipsoid(color, new Vec3(scale_factor*0.5, scale_factor*0.5, scale_factor*0.5), MATERIALS.DIFFUSE, 0.0, 0.0);
        let handleBase = new Cylinder(color, scale_factor*0.1, scale_factor*0.5, MATERIALS.DIFFUSE, 0.0, 0.0);
        let handleArm = new Cylinder(color, scale_factor*0.1, scale_factor*0.5, MATERIALS.DIFFUSE, 0.0, 0.0);
        let handleGrip = new Cylinder(color, scale_factor*0.1, scale_factor*0.5, MATERIALS.DIFFUSE, 0.0, 0.0);
        let ring1 = new Torus(color, scale_factor*0.2, scale_factor*0.03, MATERIALS.DIFFUSE, 0.0, 0.0);
        let ring2 = new Torus(color, scale_factor*0.2, scale_factor*0.03, MATERIALS.DIFFUSE, 0.0, 0.0);
        let ring3 = new Torus(color, scale_factor*0.2, scale_factor*0.03, MATERIALS.DIFFUSE, 0.0, 0.0);
        let ring4 = new Torus(color, scale_factor*0.2, scale_factor*0.03, MATERIALS.DIFFUSE, 0.0, 0.0);
        let ring5 = new Torus(color, scale_factor*0.2, scale_factor*0.03, MATERIALS.DIFFUSE, 0.0, 0.0);
        let stringA = new Cylinder(color, scale_factor*0.02, scale_factor*2.0, MATERIALS.DIFFUSE, 0.0, 0.0);
        let stringB = new Cylinder(color, scale_factor*0.02, scale_factor*5.0, MATERIALS.DIFFUSE, 0.0, 0.0);
        let stringC = new Cylinder(color, scale_factor*0.02, scale_factor*1.0, MATERIALS.DIFFUSE, 0.0, 0.0);
        let bobberSphere = new Ellipsoid(color, new Vec3(scale_factor*0.2, scale_factor*0.2, scale_factor*0.2), MATERIALS.DIFFUSE, 0.0, 0.0);
        let bobberHead = new Cylinder(color, scale_factor*0.075, scale_factor*0.05, MATERIALS.DIFFUSE, 0.0, 0.0);
        let bobberRing = new Torus(color, scale_factor*0.25, scale_factor*0.03, MATERIALS.DIFFUSE, 0.0, 0.0);

        // nodes
        this.rodBaseNode = new Node(rodBase);
        this.rodArmNode = new Node(rodArm);
        this.coreCylinderNode = new Node(coreCylinder);
        this.coreSphereNode = new Node(coreSphere);
        this.handleBaseNode = new Node(handleBase);
        this.handleArmNode = new Node(handleArm);
        this.handleGripNode = new Node(handleGrip);
        this.ring1Node = new Node(ring1);
        this.ring2Node = new Node(ring2);
        this.ring3Node = new Node(ring3);
        this.ring4Node = new Node(ring4);
        this.ring5Node = new Node(ring5);
        this.stringANode = new Node(stringA);
        this.stringBNode = new Node(stringB);
        this.stringCNode = new Node(stringC);
        this.bobberSphereNode = new Node(bobberSphere);
        this.bobberHeadNode = new Node(bobberHead);
        this.bobberRingNode = new Node(bobberRing);

        // tranformations
        this.handleGripNode.setParent(this.handleArmNode);
        this.handleArmNode.setParent(this.handleBaseNode);
        this.stringANode.setParent(this.coreSphereNode);
        this.stringBNode.setParent(this.stringANode);
        this.stringCNode.setParent(this.stringBNode);
        this.coreSphereNode.setParent(this.coreCylinderNode);
        this.handleBaseNode.setParent(this.coreCylinderNode);
        this.ring1Node.setParent(this.rodArmNode);
        this.ring2Node.setParent(this.rodArmNode);
        this.ring3Node.setParent(this.rodArmNode);
        this.ring4Node.setParent(this.rodArmNode);
        this.ring5Node.setParent(this.rodArmNode);
        this.coreCylinderNode.setParent(this.rodBaseNode);
        this.rodArmNode.setParent(this.rodBaseNode);    
        this.bobberHeadNode.setParent(this.stringBNode);
        this.bobberSphereNode.setParent(this.bobberHeadNode);
        this.bobberRingNode.setParent(this.bobberSphereNode);

        // rod arm
        this.rodArmNode.localMatrix.translate(0.0, 0.0, scale_factor*3.5);
        // rings
        this.ring1Node.localMatrix.translate(0.0, scale_factor*0.25, scale_factor*0.2);
        this.ring2Node.localMatrix.translate(0.0, scale_factor*0.25, scale_factor*1.4);
        this.ring3Node.localMatrix.translate(0.0, scale_factor*0.25, scale_factor*2.6);
        this.ring4Node.localMatrix.translate(0.0, scale_factor*0.25, scale_factor*3.8);
        this.ring5Node.localMatrix.translate(0.0, scale_factor*0.25, scale_factor*5.0);
        // core cylinder
        this.coreCylinderNode.localMatrix.translate(0.0, scale_factor*0.7, scale_factor*0.75);
        // core sphere
        this.coreSphereNode.localMatrix.translate(0.0, 0.0, 1.0);
        // handle arm
        this.handleArmNode.localMatrix.rotateY(Math.PI/2);
        this.handleArmNode.localMatrix.translate(0.4, 0.0, 0.5);
        // handle grip
        this.handleGripNode.localMatrix.rotateY(Math.PI/2);
        this.handleGripNode.localMatrix.translate(0.5, 0.0, -0.4);
        // strings
        this.stringANode.localMatrix.rotateX(-Math.PI/15);
        this.stringANode.localMatrix.translate(0.0, -0.1, scale_factor*1.4);
        this.stringBNode.localMatrix.rotateX(Math.PI/15);
        this.stringBNode.localMatrix.translate(0.0, 1.0, scale_factor*3.3);
        // bobber
        this.bobberHeadNode.localMatrix.translate(scale_factor*this.bobberX, scale_factor*(0.2+this.bobberZ), scale_factor*(2.6+this.bobberY));
        this.bobberSphereNode.localMatrix.translate(0.0, 0.0, -0.4);

        // update nodes world matrices (need to only call on root nodes)
        this.rodBaseNode.updateWorldMatrix();

        this.nodes = [
            // rod
            this.rodBaseNode,
            this.rodArmNode,
            // core
            this.coreCylinderNode,
            this.coreSphereNode,
            // handle
            this.handleBaseNode,
            this.handleArmNode,
            this.handleGripNode,
            // rings
            this.ring1Node,
            this.ring2Node,
            this.ring3Node,
            this.ring4Node,
            this.ring5Node,
            this.stringANode,
            this.stringBNode,
            this.stringCNode,
            this.bobberHeadNode,
            this.bobberSphereNode,
            this.bobberRingNode
        ]

    }

    animate(deltaTime) {

        switch(this.state){
            case FishingRod.IDLE:
                console.log("IDLE");
                this.bobberX = 0.0;
                this.bobberY = 0.0;
                this.bobberZ = 0.0;
                this.charge = 0.0;
                break;
                
            case FishingRod.CHARGING:
                console.log("CHARGING");
                this.bobberX = 0.0;
                this.bobberY = 0.0;
                this.bobberZ = 0.0;
                this.startTime = Date.now();
                break;

            case FishingRod.RELEASING:
                console.log("RELEASING");
                let dt = (Date.now() - this.startTime)*0.001;

                //this.bobberX = this.charge*this.launchSpdX*dt;
                this.bobberY = this.charge*this.launchSpdY*dt + 0.5*this.g*dt*dt;
                this.bobberZ = this.charge*this.launchSpdZ*dt;

                if(this.bobberY <= -13.0){
                this.bobberY = -13.0;
                this.state = fishingRod.FISHING;
                }
                break;

            case FishingRod.FISHING:
                console.log("FISHING");
                this.bobberY = -13.0+Math.sin(Date.now()*0.005)*0.1;
                break;

            case FishingRod.REELING:
                console.log("REELING");
                this.bobberZ += fishingRod.REELSPEED;
                if(this.bobberZ >= -1.5){
                    this.bobberY = 0.0;
                    this.state = fishingRod.IDLE;
                }
                break;
        }

        // rod base
        this.rodBaseNode.localMatrix = new Matrix4();
        if(this.state == FishingRod.CHARGING){
            console.log("HERE")
            this.rodBaseNode.localMatrix.rotateX(this.charge*(-Math.PI/2));
        }
        this.rodBaseNode.localMatrix.rotateX(Math.PI/16);
        this.rodBaseNode.localMatrix.translate(this.center.x, this.center.y, this.center.z);
        this.rodBaseNode.updateWorldMatrix();

        // handle base
        this.handleBaseNode.localMatrix = new Matrix4();
        this.handleBaseNode.localMatrix.rotateY(Math.PI/2);
        if(this.state == FishingRod.REELING){
            this.handleBaseNode.localMatrix.rotateX(-deltaTime*0.01/Math.PI);
        }
        this.handleBaseNode.localMatrix.translate(-1.5, 0.0, 0.5);

        // string C (SCALE Y COMPONENT OF STRING C TO MODIFY LENGTH)
        let strLen = Math.sqrt(this.bobberX*this.bobberX + this.bobberY*this.bobberY + this.bobberZ*this.bobberZ);
        let strRotX = Math.atan2(this.bobberZ, this.bobberY);
        this.stringCNode.localMatrix = new Matrix4();
        this.stringCNode.localMatrix.scale(1.0, strLen, 1.0);
        this.stringCNode.localMatrix.rotateX(strRotX);
        this.stringCNode.localMatrix.translate(0, 8.0, 0);
    }
}