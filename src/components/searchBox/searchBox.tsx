import React, { useRef } from 'react';
import type { BasicPokemonData, PokemonData } from '../../types'; 

interface SearchBarProps {
  pokemonInput: string;
  setPokemonInput: (value: string) => void;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
  handleFetchButtonClick: () => void;
  selectPokemonFromSuggestion: (name: string) => void;
  allPokemonNamesData: BasicPokemonData[] | undefined;
  setErrorMessage: (message: string) => void;
  setSearchedPokemonDetails: (details: PokemonData | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  pokemonInput,
  setPokemonInput,
  suggestions,
  setSuggestions,
  handleFetchButtonClick,
  selectPokemonFromSuggestion,
  allPokemonNamesData,
  setErrorMessage,
  setSearchedPokemonDetails,
}) => {
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setPokemonInput(e.target.value);
    setErrorMessage('');
    setSearchedPokemonDetails(null);

    if (query.length > 0 && allPokemonNamesData) {
      const matches = allPokemonNamesData
        .filter((p) => p.name.toLowerCase().includes(query))
        .map(p => p.name)
        .slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="search-wrapper" ref={searchWrapperRef}>
      <div className="search-container">
        <input
          type="text"
          id="pokemon-input"
          placeholder="Search for Pokémon..."
          autoComplete="off"
          value={pokemonInput}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleFetchButtonClick();
            }
          }}
        />
        <button id="fetch-button" onClick={handleFetchButtonClick}>
          Fetch Pokemon
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul id="suggestions">
          {suggestions.map((name) => (
            <li key={name} onClick={() => selectPokemonFromSuggestion(name)}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;