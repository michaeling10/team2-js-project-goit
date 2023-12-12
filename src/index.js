'use-strict';
//Imports
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
const loader = document.querySelector('.loader')
// const loaderCont = document.querySelector('.loader-container')

// API Constants
const API_KEY = '5ccf4f402158a45718561fdbb05f12b0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w400';

// Global Variables
let page = 1;
let currentContext = 'home';
let genresList;

// Event Listeners
homeBtn.addEventListener('click', showHomePage);
libraryBtn.addEventListener('click', showLibraryPage);
searchButton.addEventListener('click', performSearch);
homeBtn.addEventListener('click', () => {
  // Muestra el loader antes de cargar el Home
  showLoader();
  
  // Simula una carga (aquí deberías poner la lógica real de carga del Home)
  setTimeout(() => {
    hideLoader();
    showHomePage(); // Muestra la página después de cargar y ocultar el loader
  }, 1000);
});
searchButton.addEventListener('click', () => {
  // Muestra el loader antes de realizar la búsqueda
  showLoader();
  
  // Lógica para la búsqueda de películas (aquí deberías poner tu lógica real de búsqueda)
  const searchTerm = searchInput.value.trim();
  if (searchTerm === '') {
    hideLoader();
    Notiflix.Notify.warning('Please enter a search term.');
    return;
  }

  clearGallery();
  page = 1;
  searchMovies(searchTerm);
});

// Initialization
init();


// Función para el loader
function showLoader() {
  loader.style.display = 'block';
}
function hideLoader() {
  loader.style.display = 'none';
}
// function hideLoaderCont() {
//   loaderCont.style.display = 'none';
// }

document.addEventListener('DOMContentLoaded', () => {
  showLoader();
  setTimeout(() => {
    // hideLoaderCont();
    hideLoader();
    
  }, 1000); 
});

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

async function init() {
  try {
    genresList = await getGenresList();
    showHomePage();
  } catch (error) {
    console.error('Error initializing:', error);
  }
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

      movieDetailsContainer.innerHTML = detailsHTML;
      showModal();
    } catch (error) {
      console.error('Error processing movie details:', error);
      Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
    }
  }
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
      hideLoader();
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
      Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
      hideLoader();
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
      const endpoint =
        currentContext === 'home' ? 'trending/all/day' : 'search/movie';
      const query = currentContext === 'search' ? searchInput.value.trim() : '';

      getMovieData(endpoint, query, pageNumber)
        .then(response => {
          clearGallery();
          renderMovies(response.data.results);
        })
        .catch(error => {
          console.error('Error fetching page results:', error);
        });
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
