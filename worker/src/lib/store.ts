class store {
  anstable:any = {};
  /*
    {
      examid:{
      userid:{
      part:{
      23:"1"
      },
      part:{
      12:"2"
      }
      }
      }
    }
    */

  constructor(){
  }

  addans(data:any){
 /* data ={
  userid:323ewr,
  examid:gususuias,
  part:2,
  numer:23,
  ans:'3'
 } */
let {userid,
    examid,
    part,
    numer,
    ans} = data
  this.anstable[examid][userid][part][numer] = ans 
  }

  
printanstable(){
    console.log(this.anstable);
    
}

}
