import { useState, useEffect} from "react";
import type { ChangeEvent } from "react";
import "./App.css";

type PokemonType = {
  type: { name: string };
};

type PokemonData = {
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: { other: { ["official-artwork"]: { front_default: string } } };
  types: PokemonType[];
};

const typeColors: Record<string, string> = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  psychic: "#F85888",
  ice: "#98D8D8",
  dragon: "#7038F8",
  dark: "#705848",
  fairy: "#EE99AC",
  normal: "#A8A878",
  fighting: "#C03028",
  flying: "#A890F0",
  poison: "#A040A0",
  ground: "#E0C068",
  rock: "#B8A038",
  bug: "#A8B820",
  ghost: "#705898",
  steel: "#B8B8D0",
};

const App: React.FC = () => {
  const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1300");
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setAllPokemonNames(data.results.map((p: { name: string }) => p.name));
      } catch {
        setError("Failed to fetch Pokémon names.");
      }
    };
    fetchAllPokemonNames();
  }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setInput(value);
    setError("");
    setPokemon(null);

    if (value.length === 0) {
      setSuggestions([]);
      return;
    }
    const matches = allPokemonNames
      .filter((name) => name.includes(value))
      .slice(0, 5);
    setSuggestions(matches);
  };

  const fetchPokemon = async (name: string) => {
    if (!allPokemonNames.includes(name.toLowerCase())) {
      setError("Pokémon not found!");
      setPokemon(null);
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error("Pokémon not found!");
      const data: PokemonData = await res.json();
      setPokemon(data);
      setError("");
      setSuggestions([]);
    } catch {
      setError("Pokémon not found!");
      setPokemon(null);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setInput(name);
    fetchPokemon(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchPokemon(input);
    }
  };

  return (
    <div>
      <h1>Welcome to the Pokemon Page</h1>
      <p className="description">
        Here you can find information about your favorite Pokemon!
      </p>
      <div className="search-wrapper">
        <div className="search-container">
          <input
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Search Pokémon..."
            autoComplete="off"
          />
          <button onClick={() => fetchPokemon(input)}>Fetch Pokemon</button>
        </div>
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((name) => (
              <li key={name} onClick={() => handleSuggestionClick(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      {pokemon && (
        <div className="pokemon-details" style={{ borderColor: typeColors[pokemon.types[0].type.name] || "#28a745" }}>
          <h2 style={{ backgroundColor: typeColors[pokemon.types[0].type.name] || "#28a745" }}>
            {pokemon.name.toUpperCase()}
          </h2>
          <div className="sprite-box">
            <img
              src={pokemon.sprites.other["official-artwork"].front_default}
              alt={pokemon.name}
            />
          </div>
          <p><strong>Height:</strong> {pokemon.height}</p>
          <p><strong>Weight:</strong> {pokemon.weight}</p>
          <p><strong>Base Exp:</strong> {pokemon.base_experience}</p>
          <p>
            <strong>Types:</strong> {pokemon.types.map((t) => t.type.name).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
