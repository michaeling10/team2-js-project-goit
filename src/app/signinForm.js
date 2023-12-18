import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.js';
import Notiflix from 'notiflix';

const signIpForm = document.querySelector('#login-form');

signIpForm.addEventListener('submit', async e => {
  e.preventDefault();

  const email = signIpForm['login-email'].value;
  const password = signIpForm['login-password'].value;

  try {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    console.log(credentials);

    // close the signin modal

    const signinModal = document.querySelector('#signinModal');
    const modal = bootstrap.Modal.getInstance(signinModal);
    modal.hide();

    Notiflix.Notify.success('Welcome ' + credentials.user.email);
  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      Notiflix.Notify.warning('Wrong password', 'error');
    } else if (error.code === 'auth/user-not-found') {
      Notiflix.Notify.warning('User not found', 'error');
    } else {
      Notiflix.Notify.warning(error.message, 'error');
    }
  }
});
