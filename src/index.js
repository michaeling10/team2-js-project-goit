// index.js
'use strict';

import axios from 'axios';
import Notiflix from 'notiflix';

const homePage = document.getElementById('home-page');
const libraryBtn = document.getElementById('library-btn');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.getElementById('load-more');
const modal = document.getElementById('myModal');
const movieDetailsContainer = document.getElementById('movie-details-modal');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

const API_KEY = '5ccf4f402158a45718561fdbb05f12b0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let page = 1;

homePage.addEventListener('click', showHomePage);
libraryBtn.addEventListener('click', showLibraryPage);
loadMoreButton.addEventListener('click', loadMoreMovies);

init();

function init() {
  showHomePage();
}

function showHomePage() {
  homePage.style.display = 'block';
  loadMoreButton.style.display = 'none';
  gallery.innerHTML = '';
  getTrendingMovies();
}

function showLibraryPage() {
  Notiflix.Notify.info('Library functionality will be implemented later.');
}

function loadMoreMovies() {
  page++;
  getTrendingMovies();
}

function getTrendingMovies() {
  axios
    .get(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=${page}`)
    .then(response => {
      const movies = response.data.results;
      renderMovies(movies);
    })
    .catch(error => {
      console.error('Error fetching trending movies:', error);
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
  img.src = `${IMAGE_BASE_URL}${movie.poster_path}`;
  img.alt = movie.title;

  const movieInfo = document.createElement('div');
  movieInfo.classList.add('movie-info');
  movieInfo.innerHTML = `
    <p class="movie-title">${movie.title}</p>
    <p class="movie-genres">${getGenres(movie.genres)}</p>
    <p class="movie-release">${getReleaseYear(movie.release_date)}</p>
  `;

  card.appendChild(img);
  card.appendChild(movieInfo);

  card.addEventListener('click', event => {
    event.preventDefault(); // Evitar la acción predeterminada (por ejemplo, seguir un enlace)
    showMovieDetailsInModal(movie);
  });

  return card;
}

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
    const {
      title,
      overview,
      release_date,
      vote_average,
      vote_count,
      genres,
      popularity,
      original_title,
      poster_path,
    } = movie;
    /* 
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
          <div class="movie-info-container">
            <h2>${title} (${getReleaseYear(release_date)})</h2>            
            <p><strong>Vote / Votes</strong> ${vote_average.toFixed(
              1
            )} / ${vote_count}</p>
            <p><strong>Popularity</strong> ${popularity}</p>
            <p><strong>Original Title</strong> ${original_title}</p>
            <p><strong>Genre</strong> ${
              getGenres ? getGenres(genre_ids, genresList) : 'N/A'
            }</p>
            <p><strong>ABOUT:</strong> ${overview}</p>
          </div>
        </div>
      `;
    
    */
    const detailsHTML = `
      <div class="movie-details-container">
        <div class="movie-image-container">
          <img src="${IMAGE_BASE_URL}${poster_path}" alt="${title}" class="movie-image">
        </div>
        <div class ="movie-info-btn-container">
      
          <div class="movie-info-container">
            <h2>${title} (${getReleaseYear(release_date)})</h2>
            <p><strong>Vote / Votes</strong><span class="movie-info-vote">${vote_average}</span>   / ${vote_count} </p>
            <p><strong>Popularity</strong> ${popularity}</p>
            <p><strong>Original Title</strong> ${original_title}</p>
            <p><strong>Genres:</strong> ${getGenres(genres)}</p>

            <p><strong>Overview</strong> ${overview}</p>
          </div>
          <div class="movie-button">
            <button class="btn-add-watched">ADD TO WATCHED</button>
            <button class="btn-add-queue">ADD TO QUEUE</button>
        
          </div>
        </div>
      </div>
    `;

    movieDetailsContainer.innerHTML = detailsHTML;
    showModal();
  }
}

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

function getGenres(genres) {
  if (!genres || !Array.isArray(genres)) {
    return 'N/A';
  }
  return genres.map(genre => genre.name).join(', ');
}

function getReleaseYear(releaseDate) {
  return releaseDate ? releaseDate.slice(0, 4) : 'N/A';
}

function getProductionCountries(countries) {
  return countries.map(country => country.name).join(', ');
}
