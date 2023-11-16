import { Injectable,inject } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import { User } from '../models/user.model';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {getFirestore, setDoc, doc} from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';
import { UtilsService } from './utils.service';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(
    private storage: AngularFireStorage,

  ) {}
  private userName: string;
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  setUserName(name: string): void {
    this.userName = name;
  }
  getUserName(): string {
    return this.userName;
  }
    getAuth(){
      return getAuth();
    }
  //auth
  signIn(user: User){
    return signInWithEmailAndPassword(getAuth(),user.email,user.password);
  }
//crear usuario
  signUp(user: User){
    return createUserWithEmailAndPassword(getAuth(),user.email,user.password);
  }
  updateUser(displayName: string){
    return updateProfile(getAuth().currentUser,{displayName});

  }
  signOut(){
    return getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.router.navigate(['/login']);
  }
  //----------database------------
  setDocument(path:string, data:any){
    return setDoc(doc(getFirestore(),path),data);
  }
  async getDocument(path:string){
    return (await getDoc(doc(getFirestore(),path))).data();
  }

//Sube un video a Cloud Firestore
uploadVideo(description: string, videoFile: File) {
  if (description && videoFile) {
    const storagePath = `videos/${new Date().getTime()}_${videoFile.name}`;
    const uploadTask = this.storage.upload(storagePath, videoFile);
    uploadTask.snapshotChanges().pipe(
      finalize(async () => {
        // Obtiene la URL de descarga del video
        const downloadURL = await this.storage.ref(storagePath).getDownloadURL().toPromise();
        // Guarda los detalles del video en Cloud Firestore
        this.saveVideoDetails(description, downloadURL);
      })
    ).subscribe();
  } else {
    //console.error('Parámetros no válidos.');
  }
}
private async saveVideoDetails(description: string, downloadURL: string) {
  const user = await this.auth.currentUser;
  if (user) {
    const userData = await this.getDocument(`users/${(await user).uid}`) as User;
    const videoRef = await this.firestore.collection('videos').add({
      description: description,
      videoURL: downloadURL,
      fecha_carga: new Date(),
      uploadedBy: (await user).uid // Guardar el ID del usuario
    });
    // Agregar el ID del video a la lista de videos del usuario
    await this.firestore.collection('users').doc((await user).uid).update({
      videos: [...userData.video, videoRef.id]
    });
  }
}
}
