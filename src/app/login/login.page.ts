import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  name: string = '';
  constructor(private router: Router) {}

firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

isFormValid(): boolean {
  // Agrega aquí lógica adicional para validar el formulario según tus necesidades
  // Puedes verificar la longitud del correo electrónico, la fortaleza de la contraseña, etc.
  return !!(this.email && this.password); // Doble negación para convertir a booleano
}

  ngOnInit() {
  }


  async submit() {
    if (this.email && this.password) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.signIn({ email: this.email, password: this.password } as User)
        .then(res => {
          this.firebaseSvc.setUserName(res.user.displayName); // Establece el nombre en el servicio
          this.getUserInfo(res.user.uid);
          this.router.navigateByUrl('/tabs/tab1');
          this.utilsSvc.presentToast({
            message: `Bienvenido a To-Job ${res.user.displayName}`, // Usa displayName del usuario
            duration: 2000,
            color: 'success',
            position: 'middle',
            icon: 'person-circle-outline'
          });
        })
        .catch(error => {
          console.log(error);
          this.utilsSvc.presentToast({
            message: error.message,
            duration: 5500,
            color: 'danger',
            position: 'middle',
            icon: 'alert-circle-outline'
          });
        })
        .finally(() => {
          loading.dismiss();
        });
    }
  }


  async getUserInfo(uid: string) {
    console.log('getUserInfo function called with uid:', uid);
    if (this.email && this.password) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `users/${uid}`;

      try {
        // Espera a que se complete la operación getDocument
        const userDocument = await this.firebaseSvc.getDocument(path);

        if (userDocument) {
          // Si el documento existe, obtén los datos y realiza la lógica adicional
          const userData = userDocument as User; // Asegúrate de que User sea la interfaz adecuada

          // Almacena el nombre del usuario en una propiedad de la clase
          this.name = userData.name;

          // Lógica adicional después de establecer la información del usuario en Firestore
          this.utilsSvc.saveInLocalStorage('user', userData);
          this.router.navigateByUrl('/tabs/tab1');

          this.utilsSvc.presentToast({
            message: `Bienvenido a To-Job ${this.name}`,
            duration: 2000,
            color: 'success',
            position: 'middle',
            icon: 'person-circle-outline'
          });
        } else {
          // Manejar el caso cuando el documento no existe
          console.log('El documento no existe en Firestore.');
        }
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
