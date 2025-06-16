import { useState, useEffect}from "react";
import type{ChangeEvent, KeyboardEvent } from "react";
import "./index.css";

type PokemonType = {
  type: {
    name: string;
  };
};

type PokemonData = {
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    other: {
      ["official-artwork"]: {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
};

const TYPE_COLORS: Record<string, string> = {
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

const PokemonPage: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [error, setError] = useState<string>("");
  const [allNames, setAllNames] = useState<string[]>([]);

  
  useEffect(() => {
    const fetchNames = async () => {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1300");
        const data = await res.json();
        setAllNames(data.results.map((p: { name: string }) => p.name));
      } catch (error) {
        console.error("Failed to fetch names:", error);
      }
    };
    fetchNames();
  }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setInput(value);
    setError("");

    if (value.length > 0) {
      const matches = allNames
        .filter(name => name.includes(value))
        .slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const fetchPokemon = async (name: string) => {
    if (!allNames.includes(name.toLowerCase())) {
      setError("Pokémon not found!");
      setPokemon(null);
      return;
    }

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error("Not found");
      const data: PokemonData = await res.json();
      setPokemon(data);
      setError("");
    } catch (error) {
      
      console.error("Failed to fetch Pokémon data:", error);
      setError("Failed to fetch Pokémon data");
      setPokemon(null);
    }
  };

  const handleSuggestion = (name: string) => {
    setInput(name);
    setSuggestions([]);
    fetchPokemon(name);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchPokemon(input);
  };

  return (
    <div className="pokemon-app">
      <h1>Poke Poke Pokemonnnnnn :) </h1>
      <div className="search-wrapper">
        <div className="search-container">
          <input
            value={input}
            onChange={handleInput}
            onKeyPress={handleKeyPress}
            placeholder="Search Pokémon..."
            autoComplete="off"
          />
          <button onClick={() => fetchPokemon(input)}>Search</button>
        </div>
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map(name => (
              <li key={name} onClick={() => handleSuggestion(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {pokemon && (
        <div
          className="pokemon-card"
          style={{
            borderColor: TYPE_COLORS[pokemon.types[0].type.name] || "#28a745"
          }}
        >
          <h2
            style={{
              backgroundColor:
                TYPE_COLORS[pokemon.types[0].type.name] || "#28a745"
            }}
          >
            {pokemon.name.toUpperCase()}
          </h2>
          <div className="sprite-box">
            <img
              src={pokemon.sprites.other["official-artwork"].front_default}
              alt={pokemon.name}
            />
          </div>
          <div className="stats">
            <p>
              <strong>Height:</strong> {pokemon.height / 10}m
            </p>
            <p>
              <strong>Weight:</strong> {pokemon.weight / 10}kg
            </p>
            <p>
              <strong>Base Exp:</strong> {pokemon.base_experience}
            </p>
            <p>
              <strong>Types:</strong>{" "}
              {pokemon.types.map(t => t.type.name).join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonPage;
