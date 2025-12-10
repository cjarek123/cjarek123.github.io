/**
 * Fish entity
 */
class Fish extends Entity {

    static SWIMMING = 0;
    static HOOKED = 1;
    static CAUGHT = 2;

    constructor() {

        super();

        // initialize the state
        this.state = Fish.SWIMMING;
        this.color = Fish.hsv2rgb(Math.random() * 360, 1.0, 1.0);
        this.scale_factor = Math.sqrt(Math.random()) * (9.0 - 5.0) + 1.0;
        this.direction = Math.random() < 0.5 ? -1 : 1;
        this.position = new Vec3(Math.random() * 360 - 180, Math.random() * (115 - 30) + 30, 2.0); 

        // primitives
        let fishBody = new Ellipsoid(this.color, new Vec3(1.0, 1.0, 1.0), MATERIALS.DIFFUSE, .0, .0);
        // let fishTail = new Cone(color, scale_factor*0.25, scale_factor*0.5, MATERIALS.DIFFUSE, .0, .0);

        // nodes
        this.fishBodyNode = new Node(fishBody);
        this.fishBodyNode.updateWorldMatrix();
        // this.fishTailNode = new Node(fishTail);

        // // attach tail to body
        // this.fishTailNode.setParent(this.fishBodyNode);

        // translate fish body
        // this.fishBodyNode.localMatrix.scale(scale_factor*1.0, scale_factor*0.2, scale_factor*0.5);
        // this.fishBodyNode.localMatrix.translate(center.x, center.y, center.z);

        // // translate fish tail
        // this.fishTailNode.localMatrix.scale(3.0, 0.8, 1.5);
        // this.fishTailNode.localMatrix.rotateY(Math.PI/2);
        // this.fishTailNode.localMatrix.translate(2.0 * scale_factor, 0.0, 0.0);

        this.nodes = [
            this.fishBodyNode
        ]

    }

    static hsv2rgb(h, s, v) {
        let c = v * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = v - c;
        let r=0, g=0, b=0;

        if (h < 60)      [r,g,b] = [c,x,0];
        else if (h < 120) [r,g,b] = [x,c,0];
        else if (h < 180) [r,g,b] = [0,c,x];
        else if (h < 240) [r,g,b] = [0,x,c];
        else if (h < 300) [r,g,b] = [x,0,c];
        else              [r,g,b] = [c,0,x];

        return new Vec3(r+m, g+m, b+m);
    }

    animate(deltaTime) {
        switch(this.state){
            case Fish.SWIMMING:

                this.fishBodyNode.localMatrix = new Matrix4();
                // scale
                this.fishBodyNode.localMatrix.scale(this.scale_factor*1.5, this.scale_factor*0.2, this.scale_factor*0.5);
                // swim forward
                this.position.x = this.position.x + (this.scale_factor*this.direction*0.5);
                if(Math.abs(this.position.x) >= 160.0){ // respawn fish if reaches end of river
                    this.color = Fish.hsv2rgb(Math.random() * 360, 1.0, 1.0);
                    this.fishBodyNode.primitive.color = this.color;
                    this.scale_factor = Math.sqrt(Math.random()) * (9.0 - 5.0) + 1.0;
                    this.direction = Math.random() < 0.5 ? -1 : 1;
                    this.position.x = (-this.direction) * 160.0;
                    this.position.y =  Math.random() * (115 - 30) + 30;
                }

                this.fishBodyNode.localMatrix.translate(this.position.x, this.position.y, this.position.z);
                this.fishBodyNode.updateWorldMatrix();
                break;

            // case Fish.HOOKED:
            //     if(rod.state == fishingRod.IDLE){
            //         this.state = fish.CAUGHT;
            //         rod.fishHooked = false;
            //         rod.hookedWeight = 0.0;
            //     }
            //     break;

            // case Fish.CAUGHT:
            //     //record size and reset fish
            //     this.size = (Math.random()+0.75)*(Math.random()+0.75); //0.25 to 1.0
            //     this.x = -18.0;
            //     this.y = 0;
            //     this.z = -(Math.floor(Math.random()*10)*2)-10;
            //     this.state = fish.SWIMMING;
            //     break;
        }
    }
}