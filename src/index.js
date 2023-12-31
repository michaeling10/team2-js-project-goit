'use strict'; // Modo estricto activado correctamen//Imports
import axios from 'axios';
import Notiflix from 'notiflix';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './app/firebaseConfig.js';
import { loginCheck } from './app/loginCheck.js';
import './app/signupForm.js';
import './app/signinForm.js';
import './app/logout.js';

onAuthStateChanged(auth, async user => {
  loginCheck(user);
});

// API Constants
const API_KEY = '5ccf4f402158a45718561fdbb05f12b0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w400';

// Global Variables
let page = 1;
let currentContext = 'home';
let genresList = [];
let currentPage = 1;
const moviesPerPage = 20;

// DOM Elements
const homePage = document.getElementById('home-page');
const libraryBtn = document.getElementById('library-btn');
const homeBtn = document.getElementById('home-btn');
const gallery = document.querySelector('.gallery');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const mybutton = document.getElementById('back-to-top-btn');
const movieDetailsContainer = document.getElementById('movie-details-modal');
const modal = document.getElementById('myModal');
const loader = document.querySelector('.loader');
const watchedButton = document.getElementById('watchedButton');
const queueButton = document.getElementById('queueButton');
const openModal = document.querySelector('.open-modal-team');
const closeModal = document.querySelector('.close-modal-team');
const teamBackdrop = document.querySelector('.modal__team-backdrop');
const teamModal = document.getElementsByClassName('modal__team');

// Function Definitions

// Initialization function
async function init() {
  try {
    genresList = await getGenresList();
    if (window.location.pathname.includes('library.html')) {
      showLibraryPage();
    } else {
      showHomePage();
    }
  } catch (error) {
    console.error('Error initializing:', error);
  }
}

// Functions to show and hide the loader
function showLoader() {
  loader.style.display = 'block';
}
function hideLoader() {
  loader.style.display = 'none';
}

// Functions to handle page content
function showPageContent() {
  document.body.classList.remove('hidden');
  const onloadElement = document.getElementById('onload');
  if (onloadElement) {
    onloadElement.classList.remove('loader-position');
  }
}

function showHomePage() {
  document.body.classList.add('hidden');
  document.getElementById('onload').classList.add('loader-position');
  homePage.style.display = 'block';
  gallery.innerHTML = '';
  currentContext = 'home';
  page = 1;
  showLoader();

  setTimeout(function () {
    getMovies('trending/all/day');
    setTimeout(function () {
      hideLoader();
      showPageContent();
    });
  }, 1000);
}

function showLibraryPage() {
  Notiflix.Notify.info('Personal Library displayed', {
    timeout: 1000,
  });
  currentContext = 'watched';
  console.log('Se cargo Library');
  displayWatchedMovies();
}

// Functions to fetch and render movies

function getMovieData(endpoint, query, pageNumber) {
  return axios.get(
    `${BASE_URL}/${endpoint}?api_key=${API_KEY}&query=${query}&page=${pageNumber}`
  );
}

function getMovies(endpoint, query = '') {
  axios
    .get(
      `${BASE_URL}/${endpoint}?api_key=${API_KEY}&query=${query}&page=${page}`
    )
    .then(response => {
      const totalPages = response.data.total_pages;
      const movies = response.data.results;
      renderMovies(movies);
      createPagination(totalPages);
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
      Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
    });
}

function renderMovies(movies) {
  const fragment = document.createDocumentFragment();
  movies.forEach(movie => {
    const card = createMovieCard(movie);
    fragment.appendChild(card);
  });
  gallery.appendChild(fragment);
}

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.classList.add('movie-card');

  const imgContainer = document.createElement('div');
  imgContainer.classList.add('movie-img-container-main');

  const img = document.createElement('img');
  img.classList.add('movie-img');
  if (movie.poster_path) {
    img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
  } else {
    img.src =
      'https://s3.amazonaws.com/babelcube/covers/5c39ac1e557af_e-better-routines-and-success-successful-spiritual-habits_no_image.jpg';
  }
  img.alt = movie.title || movie.name || 'N/A';

  const movieInfo = document.createElement('div');
  movieInfo.classList.add('movie-info');
  movieInfo.innerHTML = `
    <p class="movie-title">${movie.title || movie.name || 'N/A'}</p>
    <p class="movie-genres">${getGenres(movie.genre_ids, genresList)}</p>
    <p class="movie-release">${getReleaseYear(
      movie.release_date || movie.first_air_date
    )}</p>
  `;
  card.appendChild(imgContainer);
  imgContainer.appendChild(img);
  card.appendChild(movieInfo);

  card.addEventListener('click', event => {
    event.preventDefault();
    showMovieDetailsInModal(movie);
  });
  return card;
}

// Modal handling functions
function showMovieDetailsInModal(movie) {
  if (typeof movie === 'number') {
    axios
      .get(`${BASE_URL}/movie/${movie}?api_key=${API_KEY}`)
      .then(response => {
        const movieDetails = response.data;
        renderMovieDetailsInModal(movieDetails);
        showModal();
      })
      .catch(error => {
        console.error('Error fetching movie details:', error);
        Notiflix.Notify.failure(
          'Oops! Something went wrong. Please try again.'
        );
      });
  } else {
    try {
      const {
        overview,
        vote_average,
        vote_count,
        genre_ids,
        popularity,
        original_title,
        original_name,
        poster_path,
      } = movie;

      const altText = movie.title
        ? `${movie.title} (Movie)`
        : `${movie.name} (TV Series)`;
      const originalTitle = original_title || original_name || 'N/A';
      const srcImage = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://s3.amazonaws.com/babelcube/covers/5c39ac1e557af_e-better-routines-and-success-successful-spiritual-habits_no_image.jpg';

      const detailsHTML = `
      <div class="movie-details-container">
        <div class="movie-image-container">
          <img src="${srcImage}" alt="${altText}" class="movie-image">
        </div>
        <div class ="movie-info-btn-container">      
          <div class="movie-info-container">
            <h2>${altText}</h2>
            <p><strong>Vote / Votes</strong><span class="movie-info-vote"> ${vote_average.toFixed(
              1
            )} </span>  / ${vote_count}</p>
            <p><strong>Popularity</strong> ${popularity}</p>
            <p><strong>Original Title</strong> ${originalTitle}</p>
            <p><strong>Genre</strong> ${
              getGenres ? getGenres(genre_ids, genresList) : 'N/A'
            }</p>
            <p><strong>ABOUT:</strong> ${overview}</p>
          </div>
          <div class="movie-button">
            <button class="btn-add-watched modal-watchedButton" id="watchedButton">ADD TO WATCHED</button>
            <button class="btn-add-queue modal-queueButton" id="queueButton">ADD TO QUEUE</button>
          </div>
        </div>
      </div>
      `;

      movieDetailsContainer.innerHTML = detailsHTML;
      showModal();
    } catch (error) {
      console.error('Error processing movie details:', error);
      Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
    }
  }

  const watchedMButton = document.querySelector('.modal-watchedButton');
  const queueMButton = document.querySelector('.modal-queueButton');
  const isWatched = isMovieInList(movie, 'watchedMovies');
  const isQueued = isMovieInList(movie, 'queueMovies');
  console.log('Removido de watched');

  if (watchedMButton) {
    watchedMButton.onclick = () => addToWatched(movie, watchedMButton);
    watchedMButton.disabled = isQueued;
  }

  if (queueMButton) {
    queueMButton.onclick = () => addToQueue(movie, queueMButton);
    queueMButton.disabled = isWatched;
  }

  if (isWatched) {
    watchedMButton.style.backgroundColor = '#ff6b08';
    watchedMButton.disabled = false;
    queueMButton.disabled = true;
    queueMButton.style.backgroundColor = '';
    queueMButton.style.opacity = 0.5;
    queueMButton.style.cursor = 'not-allowed';
    queueMButton.style.pointerEvents = 'none';
  } else if (isQueued) {
    queueMButton.style.backgroundColor = '#ff6b08';
    queueMButton.disabled = false;
    watchedMButton.disabled = true;
    watchedMButton.style.backgroundColor = '';
    watchedMButton.style.opacity = 0.5;
    watchedMButton.style.cursor = 'not-allowed';
    watchedMButton.style.pointerEvents = 'none';
  } else {
    watchedMButton.style.backgroundColor = '';
    queueMButton.style.backgroundColor = '';
    watchedMButton.disabled = false;
    queueMButton.disabled = false;
  }

  if (watchedMButton && queueMButton) {
    updateButtonState(
      watchedMButton,
      isWatched,
      'ADD TO WATCHED',
      'REMOVE FROM WATCHED'
    );
    updateButtonState(
      queueMButton,
      isQueued,
      'ADD TO QUEUE',
      'REMOVE FROM QUEUE'
    );

    watchedMButton.onclick = () => toggleMovieInList(movie, 'watchedMovies');
    queueMButton.onclick = () => toggleMovieInList(movie, 'queueMovies');
  }
}

function renderMovieDetailsInModal(movieDetails) {
  const {
    overview,
    vote_average,
    vote_count,
    genre_ids,
    popularity,
    original_title,
    original_name,
    poster_path,
  } = movie;

  const altText = movie.title
    ? `${movie.title} (Movie)`
    : `${movie.name} (TV Series)`;
  const originalTitle = original_title || original_name || 'N/A';

  console.log(movie);

  const detailsHTML = `
  <div class="movie-details-container">
    <div class="movie-image-container">
      <img src="${IMAGE_BASE_URL}${poster_path}" alt="${altText}" class="movie-image">
    </div>
    <div class ="movie-info-btn-container">      
      <div class="movie-info-container">
        <h2>${altText}</h2>
        <p><strong>Vote / Votes</strong><span class="movie-info-vote"> ${vote_average.toFixed(
          1
        )} </span> / ${vote_count}</p>
        <p><strong>Popularity</strong> ${popularity}</p>
        <p><strong>Original Title</strong> ${originalTitle}</p>
        <p><strong>Genre</strong> ${
          getGenres ? getGenres(genre_ids, genresList) : 'N/A'
        }</p>
        <p><strong>ABOUT:</strong> ${overview}</p>
      </div>
      <div class="movie-button">
        <button class="btn-add-watched modal-watchedButton" id="watchedButton">ADD TO WATCHED</button>
        <button class="btn-add-queue modal-queueButton" id="queueButton">ADD TO QUEUE</button>
      </div>
    </div>
  </div>
  `;
  movieDetailsContainer.innerHTML = detailsHTML;
  showModal();
}

// Cómo opera el Modal
function showModal() {
  modal.style.display = 'block';

  const span = document.querySelector('.close');
  span.addEventListener('click', () => {
    modal.style.display = 'none';
    updateMovieList();
  });

  window.addEventListener('click', event => {
    if (event.target === modal) {
      modal.style.display = 'none';
      updateMovieList();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      modal.style.display = 'none';
      updateMovieList();
    }
  });
}

function updateMovieList() {
  if (currentContext === 'watched') {
    displayWatchedMovies();
  } else if (currentContext === 'queue') {
    displayQueueMovies();
  }
}

// Utility functions
function clearGallery() {
  gallery.innerHTML = '';
}

async function getGenresList() {
  try {
    const [movieGenresResponse, tvGenresResponse] = await Promise.all([
      axios.get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`),
    ]);

    const movieGenres = movieGenresResponse.data.genres;
    const tvGenres = tvGenresResponse.data.genres;

    // Unir las dos listas de géneros
    const allGenres = [...movieGenres, ...tvGenres];

    return allGenres;
  } catch (error) {
    console.error('Error fetching genres list:', error);
    throw error;
  }
}

// Comparación entre la lista de géneros y los ID de los géneros
function getGenres(genreIds, genresList) {
  if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
    return 'N/A';
  }

  const genreNames = genreIds.map(id => {
    const genre = genresList.find(genre => genre.id === id);
    return genre ? genre.name : '';
  });

  return genreNames.join(', ');
}

function getReleaseYear(releaseDate) {
  if (releaseDate) {
    return releaseDate.slice(0, 4);
  } else {
    return 'N/A';
  }
}

function toggleMovieInList(movie, listName) {
  let list = JSON.parse(localStorage.getItem(listName)) || [];
  const index = list.findIndex(m => m.id === movie.id);

  if (index === -1) {
    list.push(movie);
  } else {
    list.splice(index, 1);
  }

  localStorage.setItem(listName, JSON.stringify(list));
  showMovieDetailsInModal(movie);
}

function isMovieInList(movie, listName) {
  let list = JSON.parse(localStorage.getItem(listName)) || [];
  return list.some(m => m.id === movie.id);
}

function updateButtonState(button, isActive, textActive, textInactive) {
  button.textContent = isActive ? textInactive : textActive;
}

//Search functions

function performSearch() {
  document.body.classList.add('hidden');
  document.getElementById('onload').classList.add('loader-position');
  currentContext = 'search';
  const searchTerm = searchInput.value.trim();
  if (searchTerm === '') {
    Notiflix.Notify.warning('Please enter a search term.');
    return;
  }
  showLoader();
  clearGallery();
  page = 1;
  searchMovies(searchTerm)
    .then(() => {
      setTimeout(function () {
        hideLoader();
        showPageContent();
      }, 1000);
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
      Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
      hideLoader();
    });
}

function searchMovies(searchTerm) {
  clearGallery();
  return new Promise((resolve, reject) => {
    axios
      .get(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}&page=${page}`
      )
      .then(response => {
        const totalPages = response.data.total_pages;
        const totalItems = response.data.total_results;
        const movies = response.data.results;

        if (movies.length === 0) {
          Notiflix.Notify.info('No movies found for the search term.');
        } else {
          Notiflix.Notify.success(`Hooray! We found ${totalItems} movies.`);
          renderMovies(movies);
          createPagination(totalPages);
        }
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  });
}

//Pagination functions

function createPagination(totalPages) {
  $('#pagination-container').pagination({
    dataSource: function (done) {
      let data = [];
      for (let i = 1; i <= totalPages; i++) {
        data.push(i);
      }
      done(data);
    },
    totalNumber: totalPages,
    pageSize: 1,
    callback: function (data, pagination) {
      const pageNumber = pagination.pageNumber;
      if (currentContext === 'watched' || currentContext === 'queue') {
        paginateLocalStorage(currentContext, pagination.pageNumber);
      } else {
        const endpoint =
          currentContext === 'home' ? 'trending/all/day' : 'search/movie';
        const query =
          currentContext === 'search' ? searchInput.value.trim() : '';

        getMovieData(endpoint, query, pageNumber)
          .then(response => {
            clearGallery();
            renderMovies(response.data.results);
          })
          .catch(error => {
            console.error('Error fetching page results:', error);
          });
      }
    },
  });
}

//WATCHED & QUEUE functions

function addToWatched(movie, button) {
  let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
  const isWatched = watchedMovies.some(m => m.id === movie.id);
  console.log('Removido de watched');

  if (!isWatched) {
    console.log('Removido de watched');
    watchedMovies.push(movie);
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    Notiflix.Notify.success('Added to Watched');
    button.style.backgroundColor = '#ff6b08';
  } else {
    console.log('Removido de watched');
    watchedMovies = watchedMovies.filter(m => m.id !== movie.id);
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    Notiflix.Notify.warning('Removed from Watched');
    button.style.backgroundColor = '';
    displayWatchedMovies();
  }
}

function addToQueue(movie, button) {
  let queueMovies = JSON.parse(localStorage.getItem('queueMovies')) || [];
  const isQueued = queueMovies.some(m => m.id === movie.id);

  if (!isQueued) {
    queueMovies.push(movie);
    Notiflix.Notify.success('Added to Queue');
    button.textContent = 'REMOVE FROM QUEUE';
    button.style.backgroundColor = '#ff6b08';
  } else {
    console.log('remover pelicula');
    queueMovies = queueMovies.filter(m => m.id !== movie.id);
    Notiflix.Notify.warning('Removed from Queue');
    button.textContent = 'ADD TO QUEUE';
    button.style.backgroundColor = '';
  }

  localStorage.setItem('queueMovies', JSON.stringify(queueMovies));

  displayQueueMovies();
}

function displayWatchedMovies() {
  watchedButton.style.backgroundColor = '#ff6b08';
  watchedButton.style.boxShadow = '0 0 15px #ff6b08';
  watchedButton.style.border = 'none';
  queueButton.style.backgroundColor = 'transparent';
  queueButton.style.boxShadow = 'none';
  queueButton.style.border = '1px solid white';
  clearGallery();
  currentContext = 'watched';
  let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  watchedMovies.slice(startIndex, endIndex).forEach(movie => {
    const card = createMovieCard(movie);
    gallery.appendChild(card);
  });

  const numberPages = Math.ceil(watchedMovies.length / moviesPerPage);
  createPagination(numberPages, currentPage, currentContext);
}

function displayQueueMovies() {
  watchedButton.style.backgroundColor = 'transparent';
  watchedButton.style.boxShadow = 'none';
  watchedButton.style.border = '1px solid white';
  queueButton.style.backgroundColor = '#ff6b08';
  queueButton.style.boxShadow = '0 0 15px #ff6b08';
  queueButton.style.border = 'none';
  currentContext = 'queue';
  clearGallery();
  let queueMovies = JSON.parse(localStorage.getItem('queueMovies')) || [];
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  queueMovies.slice(startIndex, endIndex).forEach(movie => {
    const card = createMovieCard(movie);
    gallery.appendChild(card);
  });

  const numberPages = Math.ceil(queueMovies.length / moviesPerPage);
  createPagination(numberPages, currentPage, currentContext);
}

function paginateLocalStorage(context, pageNumber) {
  let movies;
  if (currentContext === 'watched') {
    movies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
  } else {
    movies = JSON.parse(localStorage.getItem('queueMovies')) || [];
  }

  const startIndex = (pageNumber - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const pagedMovies = movies.slice(startIndex, endIndex);

  clearGallery();
  pagedMovies.forEach(movie => {
    const card = createMovieCard(movie);
    gallery.appendChild(card);
  });
}

// Modal Team funcitons

function openModalTeam(event) {
  teamBackdrop.classList.remove('team__backdrop--hidden');
  document.addEventListener('keydown', onEscapeClose);
  document.addEventListener('click', onBackdropClose);
  teamModal[0].classList.add('openModalAnimationTeam');
}

function closeModalTeam(event) {
  teamModal[0].classList.remove('closeModalAnimationTeam');
  teamBackdrop.classList.add('team__backdrop--hidden');
  document.removeEventListener('keydown', onEscapeClose);
  document.body.style.overflow = '';
}

function onEscapeClose(event) {
  if (event.code === 'Escape') {
    teamModal[0].classList.remove('openModalAnimationTeam');
    teamModal[0].classList.add('closeModalAnimationTeam');
    setTimeout(() => {
      closeModalTeam();
    }, 200);
    closeModalTeam();
  }
}

function onBackdropClose(event) {
  if (event.target === teamBackdrop) {
    teamModal[0].classList.remove('openModalAnimationTeam');
    teamModal[0].classList.add('closeModalAnimationTeam');
    setTimeout(() => {
      closeModalTeam();
    }, 200);
  }
}

// Event listeners
homeBtn.addEventListener('click', showHomePage);
libraryBtn.addEventListener('click', showLibraryPage);
openModal.addEventListener('click', openModalTeam);
closeModal.addEventListener('click', closeModalTeam);

if (searchInput) {
  searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
      performSearch();
    }
  });
}

if (searchButton) {
  searchButton.addEventListener('click', performSearch);
}

if (watchedButton) {
  watchedButton.addEventListener('click', displayWatchedMovies);
}

if (queueButton) {
  queueButton.addEventListener('click', displayQueueMovies);
}

//SCROLL BUTTON
window.onscroll = function () {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = 'block';
  } else {
    mybutton.style.display = 'none';
  }
};

mybutton.addEventListener('click', function () {
  document.documentElement.scrollTop = 0;
});

// Initialization
init();
