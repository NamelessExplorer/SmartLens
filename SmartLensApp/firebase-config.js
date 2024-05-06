import { getApp, getApps, initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from "firebase/storage";
import {
    FIREBASE_API_KEY,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_APP_ID,
    FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_DOMAIN,
  } from "@env";
import { UploadTask } from 'expo-file-system';

// Initialize Firebase
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  //databaseURL: 'https://project-id.firebaseio.com',
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  //messagingSenderId: 'sender-id',
  appId: FIREBASE_APP_ID,
  //measurementId: 'G-measurement-id',
};

if(getApps().length === 0){
    initializeApp(firebaseConfig);
}

/**
 *
 * @param {*} uri
 * @param {*} name
 */


const uploadToFirebase = async (uri, name, onProgress) => {
    const fetchResponse = await fetch(uri);
    const theBlob = await fetchResponse.blob();
    console.log(theBlob);

    const storage = getStorage();
    const storageRef = ref(storage, 'images/${name}');

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    const uploadTask = uploadBytesResumable(storageRef, theBlob);
    return new Promise((resolve, reject)=>{
        uploadTask.on('state_changed', 
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress && onProgress(progress);
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          }, 
      (error) => {
        // Handle unsuccessful uploads
        reject(error)
      }, 
      async () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadURL,
          metadata: UploadTask.snapshot.metadata,
        })
      }
    );
    })}


const fbApp = getApp();
const fbStorage = getStorage();

export {fbApp, fbStorage, uploadToFirebase};

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
