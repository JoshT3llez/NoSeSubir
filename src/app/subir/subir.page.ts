import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-subir',
  templateUrl: './subir.page.html',
  styleUrls: ['./subir.page.scss'],
})
export class SubirPage {
  description: string = '';
  descriptionLength: number = 0;
  isFileSelectionEnabled: boolean = false; // Agrega esta línea para definir la propiedad 'description'

  constructor(private firebaseService: FirebaseService,
    private alertController: AlertController) {}



 
    onDescriptionInput(event: any) {
      this.descriptionLength = event.target.value.length;
      this.isFileSelectionEnabled = this.descriptionLength > 0;
    }

  onSubmit(form: any) {
    console.log('Formulario enviado:', form.value);
  
    // Obtén la descripción y asegúrate de que no exceda los 50 caracteres
    const description = this.description ? this.description.substring(0, 50) : '';
  
    const videoFile = form.value.videoFile;
  
    // Verifica si hay una descripción válida antes de continuar
    if (!description) {
      console.error('La descripción es obligatoria.');
      return;
    }

    // Verifica si hay un archivo seleccionado
    if (videoFile) {
      // Sube el video utilizando el servicio de Firebase
      this.uploadVideoWithDescription(description, videoFile);
    } else {
     // console.error('No se ha seleccionado ningún archivo.');
    }
  }

  private async uploadVideoWithDescription(description: string, videoFile: File) {
    await this.firebaseService.uploadVideo(description, videoFile);
  
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El video se ha subido con éxito.',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            // Restablece el formulario después de aceptar la alerta
            this.resetForm();
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  private resetForm() {
    // Restablece el formulario
    this.description = '';
    // ... (restablece cualquier otra propiedad del formulario si es necesario)
  }

  
  async onFileSelected(event: any, form: any) {
    const inputElement = event.target as HTMLInputElement;
    console.log('Input Element:', inputElement);
  
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      console.log('Archivo seleccionado:', file);
  
      // Obtén la descripción del formulario
      const description = this.description ? this.description.substring(0, 50) : '';
  
      // Sube el video utilizando el servicio de Firebase
      await this.firebaseService.uploadVideo(description, file);
    } else {
      console.error('No se ha seleccionado ningún archivo.');
    }
  }
}