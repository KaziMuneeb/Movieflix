import { useState, useEffect } from "react";

const KEY = "4e1fc89f";

export function useFetch(query) {
  const [movies, setMovies] = useState([]);
  const [isLoaded, setIsLoaded] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      setIsLoaded(false);
      try {
        var res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${query}
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

  return { movies, isLoaded, error };
}
