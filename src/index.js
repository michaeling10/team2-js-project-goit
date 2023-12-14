'use strict'; // Modo estricto activado correctamen//Imports
import axios from 'axios';
import Notiflix from 'notiflix';

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

// API Constants
const API_KEY = '5ccf4f402158a45718561fdbb05f12b0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w400';

// Global Variables
let page = 1;
let currentContext = 'home';
let genresList;
let currentPage = 1;
const moviesPerPage = 20;

// Event Listeners

homeBtn.addEventListener('click', showHomePage);

libraryBtn.addEventListener('click', showLibraryPage);
if (searchButton) {
  searchButton.addEventListener('click', performSearch);
}
if (watchedButton) {
  watchedButton.addEventListener('click', displayWatchedMovies);
}
if (queueButton) {
  queueButton.addEventListener('click', displayQueueMovies);
}

// Initialization
init();

// Función para el loader
function showLoader() {
  loader.style.display = 'block';
}
function hideLoader() {
  loader.style.display = 'none';
}

function showPageContent() {
  document.body.classList.remove('hidden');
  const onloadElement = document.getElementById('onload');
  if (onloadElement) {
    onloadElement.classList.remove('loader-position');
  }
}
// Functions
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
    }); // Ajusta el tiempo según sea necesario
  }, 1000);
}

function showLibraryPage() {
  Notiflix.Notify.info('Personal Library displayed');
  currentContext = 'watched';
  console.log('Se cargo Library');
  displayWatchedMovies();
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

  const img = document.createElement('img');
  img.classList.add('movie-img');
  img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
  img.alt = movie.title;

  const movieInfo = document.createElement('div');
  movieInfo.classList.add('movie-info');
  movieInfo.innerHTML = `
    <p class="movie-title">${movie.title}</p>
    <p class="movie-genres">${getGenres(movie.genre_ids, genresList)}</p>
    <p class="movie-release">${getReleaseYear(movie.release_date)}</p>
  `;

  card.appendChild(img);
  card.appendChild(movieInfo);

  card.addEventListener('click', event => {
    event.preventDefault();
    showMovieDetailsInModal(movie);
  });

  return card;
}

// Modal con la información de la película

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
        title,
        overview,
        release_date,
        vote_average,
        vote_count,
        genre_ids,
        popularity,
        original_title,
        poster_path,
      } = movie;

      const detailsHTML = `
      <div class="movie-details-container">
        <div class="movie-image-container">
          <img src="${IMAGE_BASE_URL}${poster_path}" alt="${title}" class="movie-image">
        </div>
        <div class ="movie-info-btn-container">      
          <div class="movie-info-container">
            <h2>${title} (${getReleaseYear(release_date)})</h2>
            <p><strong>Vote / Votes</strong><span class="movie-info-vote"> ${vote_average.toFixed(
              1
            )} </span> / ${vote_count}</p>
            <p><strong>Popularity</strong> ${popularity}</p>
            <p><strong>Original Title</strong> ${original_title}</p>
            <p><strong>Genre</strong> ${
              getGenres ? getGenres(genre_ids, genresList) : 'N/A'
            }</p>
            <p><strong>ABOUT:</strong> ${overview}</p>
          </div>
          <div class="movie-button">
            <button class="btn-add-watched">ADD TO WATCHED</button>
            <button class="btn-add-queue">ADD TO QUEUE</button>
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
  document
    .querySelector('.btn-add-watched')
    .addEventListener('click', function () {
      addToWatched(movie);
    });
  document
    .querySelector('.btn-add-queue')
    .addEventListener('click', function () {
      addToQueue(movie);
    });
}

// Cómo opera el Modal
function showModal() {
  modal.style.display = 'block';

  const span = document.querySelector('.close');
  span.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', event => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      modal.style.display = 'none';
    }
  });
}

// Función para obtener la lista de géneros
async function getGenresList() {
  try {
    const response = await axios.get(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    );
    return response.data.genres;
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
    return genre ? genre.name : 'Unknown Genre';
  });

  return genreNames.join(', ');
}

function getReleaseYear(releaseDate) {
  return releaseDate ? releaseDate.slice(0, 4) : 'N/A';
}

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

function clearGallery() {
  gallery.innerHTML = '';
}

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

function getMovieData(endpoint, query, pageNumber) {
  return axios.get(
    `${BASE_URL}/${endpoint}?api_key=${API_KEY}&query=${query}&page=${pageNumber}`
  );
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

//WATCHED & QUEUE

function addToWatched(movie) {
  let watchedMovies = JSON.parse(localStorage.getItem('watchedMovies')) || [];
  watchedMovies.push(movie);
  localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
  Notiflix.Notify.success('Added to Watched');
}

function addToQueue(movie) {
  let queueMovies = JSON.parse(localStorage.getItem('queueMovies')) || [];
  queueMovies.push(movie);
  localStorage.setItem('queueMovies', JSON.stringify(queueMovies));
  Notiflix.Notify.success('Added to Queue');
}

function displayWatchedMovies() {
  watchedButton.style.backgroundColor = '#ff6b08';
  watchedButton.style.boxShadow = '0 0 15px #ff6b08';
  watchedButton.style.border = 'none';
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


// MODAL TEAM 

openModal.addEventListener('click', openModalTeam);
closeModal.addEventListener('click', closeModalTeam);

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


// END MODAL TEAM 