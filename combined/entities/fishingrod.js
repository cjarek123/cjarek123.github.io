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
            // this.grassNode
        ]

    }

    animate(deltaTime) {
        switch(this.state){
            case fishingRod.IDLE:
                console.log("IDLE");
                this.bobberX = 0.0;
                this.bobberY = 0.0;
                this.bobberZ = 0.0;
                this.charge = 0.0;
                break;
                
            case fishingRod.CHARGING:
                console.log("CHARGING");
                this.bobberX = 0.0;
                this.bobberY = 0.0;
                this.bobberZ = 0.0;
                this.startTime = Date.now();
                break;

            case fishingRod.RELEASING:
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

            case fishingRod.FISHING:
                console.log("FISHING");
                this.bobberY = -13.0+Math.sin(Date.now()*0.005)*0.1;
                break;

            case fishingRod.REELING:
                console.log("REELING");
                this.bobberZ += fishingRod.REELSPEED;
                if(this.bobberZ >= -1.5){
                    this.bobberY = 0.0;
                    this.state = fishingRod.IDLE;
                }
                break;
        }
    }
}