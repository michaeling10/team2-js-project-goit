// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBgzK-oQT0cPqFg2M1zVC8BhoC7vTBL_vg',
  authDomain: 'goit-js-group-project.firebaseapp.com',
  projectId: 'goit-js-group-project',
  storageBucket: 'goit-js-group-project.appspot.com',
  messagingSenderId: '807486212967',
  appId: '1:807486212967:web:b4847cc63e916c3debfdc2',
  measurementId: 'G-DKWQDSQZBE',
};

// Initialize Firebase si algo ponemos export
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const analytics = getAnalytics(app);
