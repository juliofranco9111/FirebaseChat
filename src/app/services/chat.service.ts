import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';


// Inteface
import { Mensaje } from '../interfaces/mensaje.interface';




@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  public chats: Mensaje[] = [];
  public usuario: any = {};



  constructor(private afs: AngularFirestore,
              public afAuth: AngularFireAuth) {
    // Escuchar el estado de autenticación

    this.afAuth.authState.subscribe( user => {
      console.log('Estado del usuario ', user);

      if( !user ){
        return;
      }

      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
      this.usuario.img = user.photoURL;

    } );

  }

  login(proveedor: string): any {
    this.afAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }
  logout(): any {
    this.usuario = {};
    this.afAuth.signOut();
  }

  cargarMensajes(): any {
    // Ref es la query para mandar a firebase
    this.itemsCollection = this.afs.collection<Mensaje>
      ('chats', ref => ref.orderBy('fecha', 'desc').limit(50));

    return this.itemsCollection.valueChanges()
      .pipe(map((mensajes: Mensaje[]) => {
        console.log(mensajes);
        this.chats = [];

        for (const mensaje of mensajes) {
          // Ingresar el mensaje para que quede el primero como último
          this.chats.unshift(mensaje);
        }

        return this.chats;

        // this.chats = mensajes;
      }));

  }

  agregarMensaje(texto: string): any {

    // TODO falta el UID

    const mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid,
      img: this.usuario.img
    };

    return this.itemsCollection.add(mensaje);
  }
}
