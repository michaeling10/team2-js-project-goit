'use-strict';
//Imports
import axios from 'axios';
import Notiflix from 'notiflix';

// DOM Elements
const homePage = document.getElementById('home-page');
const libraryBtn = document.getElementById('library-btn');
const homeBtn = document.getElementById('home-btn');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.getElementById('load-more');
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

// Event Listeners
homeBtn.addEventListener('click', showHomePage);
libraryBtn.addEventListener('click', showLibraryPage);
loadMoreButton.addEventListener('click', loadMoreMovies);
searchButton.addEventListener('click', performSearch);

// Initialization
init();

// Functions
function init() {
  showHomePage();
}

function showHomePage() {
  homePage.style.display = 'block';
  loadMoreButton.style.display = 'none';
  gallery.innerHTML = '';
  getMovies('trending/movie/day');
}

function showLibraryPage() {
  Notiflix.Notify.info('Library functionality will be implemented later.');
}

function loadMoreMovies() {
  page++;
  const endpoint =
    searchInput.value.trim() === '' ? 'trending/movie/day' : 'search/movie';
  getMovies(endpoint);
}

function getMovies(endpoint) {
  axios
    .get(`${BASE_URL}/${endpoint}?api_key=${API_KEY}&page=${page}`)
    .then(response => {
      const movies = response.data.results;
      renderMovies(movies);
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
  loadMoreButton.style.display = 'block';
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

function showMovieDetails(movie) {
  if (typeof movie === 'number') {
    axios
      .get(`${BASE_URL}/movie/${movie}?api_key=${API_KEY}`)
      .then(response => {
        const movieDetails = response.data;
        renderMovieDetails(movieDetails);
        showModal();
      })
      .catch(error => {
        console.error('Error fetching movie details:', error);
        Notiflix.Notify.failure(
          'Oops! Something went wrong. Please try again.'
        );
      });
  } else {
    const { title, overview, release_date, vote_average, genres } = movie;

    const detailsHTML = `
      <h2>${title} (${getReleaseYear(release_date)})</h2>
      <p><strong>Genres:</strong> ${getGenres(genres)}</p>
      <p><strong>Rating:</strong> ${vote_average}</p>
      <p><strong>Overview:</strong> ${overview}</p>
    `;

    movieDetailsContainer.innerHTML = detailsHTML;
    showModal();
  }
}

function getGenres(genres) {
  if (!genres || !Array.isArray(genres)) {
    return 'N/A';
  }
  return genres.map(genre => genre.name).join(', ');
}

function getReleaseYear(releaseDate) {
  return releaseDate ? releaseDate.slice(0, 4) : 'N/A';
}

function performSearch() {
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
  axios
    .get(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}&page=${page}`
    )
    .then(response => {
      const movies = response.data.results;

      if (movies.length === 0) {
        Notiflix.Notify.info('No movies found for the search term.');
      } else {
        Notiflix.Notify.success(`Hooray! We found ${movies.length} movies.`);
        renderMovies(movies);
        showLoadMoreButton();
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

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}
