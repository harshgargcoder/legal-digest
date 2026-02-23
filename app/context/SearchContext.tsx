"use client";

import { createContext, useContext, useState } from "react";

const SearchContext = createContext<any>(null);

export function SearchProvider({ children }: any) {
  const [search, setSearch] = useState("");

  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}