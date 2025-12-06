class fish{

  static SWIMMING = 0;
  static HOOKED = 1;
  static CAUGHT = 2;
  static ESCAPED = 3;


  constructor(){
    this.state = fish.SWIMMING;
    this.size = (Math.random()+0.5)*(Math.random()+0.5); //0.25 to 1.0
    this.x = Math.random()*36.0-18.0;
    this.y = 0;
    this.z = -(Math.floor(Math.random()*10)*2)-10;
  }

  update(){
    switch(this.state){
      case fish.SWIMMING:
        this.x += this.size*0.1;
        if(this.x > 18.0){
          this.size = (Math.random()+0.5)*(Math.random()+0.5);
          this.x = -18.0;
        }
      break;
      case fish.HOOKED:
      break;
      case fish.CAUGHT:
      break;
      case fish.ESCAPED:
      break;
    }
  }
}