class fishingRod {
  static IDLE = 0;
  static CHARGING = 1;
  static RELEASING = 2;
  static FISHING = 3;
  static REELING = 4;
  static REELSPEED = 0.2;

  fishHooked = false;
  hookedFishWeight = 0.0;

  constructor(){
    this.charge = 0.0;
    this.state = fishingRod.IDLE;
    this.bobberX = 0.0;
    this.bobberY = 0.0;
    this.bobberZ = 0.0;
    this.launchSpdX = 0.0;
    this.launchSpdY = 10.0;
    this.launchSpdZ = -10.0;
    this.g = -10.0;
    this.startTime = 0.0;
  }

  update(){
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