import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-registrer',
  templateUrl: './registrer.page.html',
  styleUrls: ['./registrer.page.scss'],
})
export class RegistrerPage implements OnInit {
  uid : string;
  email: string = '';
  password: string = '';
  name: string = '';

firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

isFormValid(): boolean {
  // Agrega aquí lógica adicional para validar el formulario según tus necesidades
  // Puedes verificar la longitud del correo electrónico, la fortaleza de la contraseña, etc.
  return !!(this.email && this.password && this.name); // Doble negación para convertir a booleano
}

  ngOnInit() {
  }


 async submit() {
    if (this.email && this.password && this.name) {
      const loading = await this.utilsSvc.loading();
      await loading.present();
      try {
        await this.firebaseSvc.signUp({ email: this.email, password: this.password, name: this.name } as User)
        .then(res => {
          this.firebaseSvc.updateUser(this.name);
          let uid = res.user.uid;

          this.uid = uid;

          this.setUserInfo(uid);
        })
      } catch (error) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 5500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }

    }
  }

  async setUserInfo(uid: string) {
    if (this.email && this.password && this.name) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `users/${uid}`;

      try {
        const userData = {
          name: this.name,
          email: this.email,
        };

        // Espera a que se complete la operación setDocument
        await this.firebaseSvc.setDocument(path, userData);

        // Lógica adicional después de establecer la información del usuario en Firestore
        this.utilsSvc.saveInLocalStorage('user', { uid, name: this.name, email: this.email });
        this.utilsSvc.routerLink('/tabs/tab1');
      } catch (error) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 5500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }
    }
  }
}
