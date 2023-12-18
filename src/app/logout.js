import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig.js';
const logout = document.querySelector('#logout');

logout.addEventListener('click', async () => {
  await signOut(auth);
  console.log('User signed out');

  window.location.href = 'team2-js-project-goit/index.html';
});
