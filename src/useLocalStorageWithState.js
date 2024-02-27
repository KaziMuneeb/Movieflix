import { useState, useEffect } from "react";

export function useLocalStorageWithState(initialValue = [], storageKey) {
  if (localStorage.getItem(storageKey) === null) {
    localStorage.setItem(storageKey, JSON.stringify([]));
  }

  const [value, setValue] = useState(function () {
    const watchlist = localStorage.getItem(storageKey);
    return storageKey ? JSON.parse(watchlist) : initialValue;
  });

  useEffect(
    function () {
      localStorage.setItem(storageKey, JSON.stringify(value));
    },
    [value, storageKey]
  );
  return [value, setValue];
}
