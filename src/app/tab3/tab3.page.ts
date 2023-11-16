import { Component, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';
import { signOut } from 'firebase/auth';
import { User } from '../models/user.model';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

firebaseSvc = inject(FirebaseService);
utilsSvc = inject(UtilsService);

user(): User {
  return this.utilsSvc.getFromLocalStorage('user');
}

signOut(){
  this.firebaseSvc.signOut().then(()=>{
    this.utilsSvc.router.navigate(['/login']);
  })
}



}
