'use-strict';
//Imports
import axios from 'axios';
import Notiflix from 'notiflix';

// DOM Elements
const homePage = document.getElementById('home-page');
const libraryBtn = document.getElementById('library-btn');
const homeBtn = document.getElementById('home-btn');
const gallery = document.querySelector('.gallery');
const modal = document.getElementById('modal');
const movieDetailsContainer = document.getElementById('movie-details');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// API Constants
const API_KEY = '5ccf4f402158a45718561fdbb05f12b0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w400';

// Global Variables
let page = 1;
let currentContext = 'home';
let genresList = [];

// Event Listeners
homeBtn.addEventListener('click', showHomePage);
libraryBtn.addEventListener('click', showLibraryPage);
searchButton.addEventListener('click', performSearch);

// Initialization
init();

// Functions
function init() {
  showHomePage();
  fetchGenres();
}

function showHomePage() {
  homePage.style.display = 'block';
  gallery.innerHTML = '';
  currentContext = 'home';
  page = 1;
  getMovies('trending/all/day');
}

function showLibraryPage() {
  Notiflix.Notify.info('Library functionality will be implemented later.');
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
  img.src = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : 'url_to_default_image.jpg';
  img.alt = movie.title;
  const movieInfo = document.createElement('div');
  movieInfo.classList.add('movie-info');
  movieInfo.innerHTML = `<p class="movie-title">${movie.title}</p>
                           <p class="movie-genres">${getGenres(
                             movie.genres
                           )}</p>
                           <p class="movie-release">${getReleaseYear(
                             movie.release_date
                           )}</p>`;
  card.appendChild(img);
  card.appendChild(movieInfo);
  card.addEventListener('click', () => {
    showMovieDetails(movie);
  });
  return card;
}

function fetchGenres() {
  axios
    .get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
    .then(response => {
      genresList = response.data.genres;
    })
    .catch(error => console.error('Error fetching genres:', error));
}

function getGenres(genreIds) {
  if (!genreIds || !Array.isArray(genreIds)) {
    return 'N/A';
  }

  return genreIds
    .map(genreId => {
      const genre = genresList.find(g => g.id === genreId);
      return genre ? genre.name : 'N/A';
    })
    .join(', ');
}

function getReleaseYear(releaseDate) {
  return releaseDate ? releaseDate.slice(0, 4) : 'N/A';
}

function performSearch() {
  currentContext = 'search';
  const searchTerm = searchInput.value.trim();
  if (searchTerm === '') {
    Notiflix.Notify.warning('Please enter a search term.');
    return;
  }
  clearGallery();
  page = 1;
  searchMovies(searchTerm);
}

function searchMovies(searchTerm) {
  clearGallery();
  page = 1;
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
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
      Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
    });
}

function clearGallery() {
  gallery.innerHTML = '';
}

function createPagination(totalPages) {
  const paginationContainer = document.querySelector('.pagination-container');
  paginationContainer.innerHTML = '';

  let maxPagesToShow = totalPages;
  currentContext === 'home' ? 5 : 10;

  let startPage = Math.max(page - Math.floor(maxPagesToShow / 2), 1);
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.toggle('active', i === page);

    pageButton.addEventListener('click', () => loadPageResults(i));
    paginationContainer.appendChild(pageButton);
  }
}

function loadPageResults(pageNumber) {
  page = pageNumber;

  const endpoint =
    currentContext === 'home' ? 'trending/all/day' : 'search/movie';
  const query = currentContext === 'search' ? searchInput.value.trim() : '';

  axios
    .get(
      `${BASE_URL}/${endpoint}?api_key=${API_KEY}&query=${query}&page=${page}`
    )
    .then(response => {
      const movies = response.data.results;
      if (movies.length === 0) {
        Notiflix.Notify.info('No movies found for this page.');
        return;
      }
      clearGallery();
      renderMovies(movies);
    })
    .catch(error => {
      console.error('Error fetching page results:', error);
      Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
    });
}
