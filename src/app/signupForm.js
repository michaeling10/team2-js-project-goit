import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.js';
import Notiflix from 'notiflix';

const signupForm = document.querySelector('#signup-form');

signupForm.addEventListener('submit', async e => {
  e.preventDefault();

  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  console.log(email, password);

  try {
    const userCredentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(userCredentials);

    // close the signup modal

    const signupModal = document.querySelector('#signupModal');
    const modal = bootstrap.Modal.getInstance(signupModal);
    modal.hide();

    Notiflix.Notify.success('Register success');
  } catch (error) {
    console.log(error.message);
    console.log(error.code);

    if (error.code === 'auth/email-already-in-use') {
      Notiflix.Notify.warning('Email already in use');
    } else if (error.code === 'auth/invalid-email') {
      Notiflix.Notify.warning('Invalid email');
    } else if (error.code === 'auth/weak-password') {
      Notiflix.Notify.warning('Password is too weak');
    } else if (error.code) {
      Notiflix.Notify.warning('Something went wrong');
    }
  }
});
