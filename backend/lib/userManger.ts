
// {
//     user ==> [
//         {
//             id:1,
//             name: 'John',

//         }
//     ]
// }

interface User {
  id: string;
  // other properties
}

export class userManager {
  private static instance: userManager;
  user: { [examid: string]: User[] };

  public static getInstance() {
    if (!this.instance) {
      this.instance = new userManager();

    }
    return this.instance;
  }

  private constructor() {
    this.user={}
  }


  adduser(examid:string,user:any){

    if(!this.user[examid]){
      this.user[examid] = []
    }
    this.user[examid] = [...this.user[examid] ,user]
    console.log("user added ");
  }
  removeuser(examid:string,user:any){
    this.user[examid] = this.user[examid].filter((u:any)=> u!== user.id)
    console.log("user removed ");
  }

  isuserexist(examid:string,user:any){    
    if(!this.user[examid]){
      return false
    }
    let status = this.user[examid].find((u:any)=> u == user)    
    return status
  }



}
