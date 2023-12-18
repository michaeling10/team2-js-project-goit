const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const libraryBtn = document.getElementById('library-btn');

console.log(loggedOutLinks);
console.log(loggedInLinks);

export const loginCheck = user => {
  if (user) {
    loggedInLinks.forEach(link => (link.style.display = 'block'));
    loggedOutLinks.forEach(link => (link.style.display = 'none'));
    libraryBtn.style.display = 'block';
  } else {
    loggedInLinks.forEach(link => (link.style.display = 'none'));
    loggedOutLinks.forEach(link => (link.style.display = 'block'));
    libraryBtn.style.display = 'none';
  }
};
