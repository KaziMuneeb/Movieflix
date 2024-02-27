import { useEffect, useState } from "react";
import StarRating from "./Star-Rating";
const KEY = "4e1fc89f";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoaded, setIsLoaded] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      setIsLoaded(false);
      try {
        var res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}
  `,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Something went wrong!!");

        var data = await res.json();
        if (data.Response === "False") throw new Error(data.Error);

        setMovies(data.Search);

        setIsLoaded(true);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError("");
      setIsLoaded(true);
      return;
    }
    fetchData();
    return function () {
      controller.abort();
    };
  }, [query]);

  function handleSelectMovie(id) {
    setSelectedMovie((curr) => (id === curr ? null : id));
  }
  function handleCloseMovie() {
    setSelectedMovie(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleRemoveWatched(id) {
    setWatched((watched) => watched.filter((mov) => mov.imdbID !== id));
  }
  return (
    <>
      <Navbar>
        {" "}
        <SearchBar query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        {" "}
        <Box>
          {isLoaded ? (
            <MovieListing movies={movies} onSelectMovie={handleSelectMovie} />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <Loaded />
          )}
        </Box>
        <Box>
          {selectedMovie ? (
            <MovieDetails
              id={selectedMovie}
              closeSelectedMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watchedList={watched}
            />
          ) : (
            <>
              {" "}
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                onRemoveWatched={handleRemoveWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}

function MovieListing({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ id, closeSelectedMovie, onAddWatched, watchedList }) {
  const [movie, setMovie] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const added = watchedList.map((mov) => mov.imdbID).includes(id);
  const watchedUserRating = watchedList.find(
    (mov) => mov.imdbID === id
  )?.userRating;
  const {
    Title: title,
    // Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const addMovie = {
      title: title,
      imdbID: id,
      imdbRating: imdbRating,
      userRating: userRating,
      poster: poster,
      runtime: Number(runtime.split(" ").at(0)),
    };
    onAddWatched(addMovie);
    closeSelectedMovie();
  }

  useEffect(
    function () {
      if (!title) return;
      document.title = `${title}`;
      return function () {
        document.title = "Movieflix";
      };
    },
    [title]
  );

  useEffect(() => {
    setIsLoaded(false);
    async function getMoviewDetails() {
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${id}
    `);
      const data = await res.json();
      setIsLoaded(true);
      setMovie(data);
    }
    getMoviewDetails();
  }, [id]);

  return (
    <div className="details">
      {isLoaded ? (
        <>
          <header>
            <button className="btn-back" onClick={closeSelectedMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!added ? (
                <>
                  {" "}
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={(id) => handleAdd(id)}>
                      + Add to watchlist
                    </button>
                  )}
                </>
              ) : (
                <p>You already rated this movie with {watchedUserRating} ⭐</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      ) : (
        <Loaded />
      )}
    </div>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onRemoveWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovieList
          movie={movie}
          key={movie.title}
          onRemoveWatched={onRemoveWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovieList({ movie, onRemoveWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onRemoveWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🎬</span>
      <h1 style={{ color: "black" }}>MOVIEFLIX</h1>
    </div>
  );
}

function SearchBar({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Loaded() {
  return <p className="loader">Loading Movies...</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message} ⚠⚠</p>;
}
// function WatchBox() {
//   const [watched, setWatched] = useState(tempWatchedData);

//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }
