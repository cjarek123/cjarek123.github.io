class fishingRod {
  static IDLE = 0;
  static CHARGING = 1;
  static RELEASING = 2;
  static FISHING = 3;
  static REELING = 4;

  constructor(){
    this.charge = 0.0;
    this.state = fishingRod.IDLE;
  }

  update(){
    switch(this.state){
      case fishingRod.IDLE:
        console.log("IDLE");
      break;
      case fishingRod.CHARGING:
        console.log("CHARGING");
      break;
      case fishingRod.RELEASING:
        console.log("RELEASING");
      break;
      case fishingRod.FISHING:
        console.log("FISHING");
      break;
      case fishingRod.REELING:
        console.log("REELING");
      break;
    }
  }
}