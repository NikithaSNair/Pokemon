import axios from 'axios';
import type { PokemonData, BasicPokemonData } from './types'; 

export const fetchPokemonDetails = async (identifier: string): Promise<PokemonData> => {
  const fetchUrl = identifier.startsWith('http')
    ? identifier
    : `https://pokeapi.co/api/v2/pokemon/${identifier.toLowerCase()}`;
  const response = await axios.get<PokemonData>(fetchUrl);
  return response.data;
};

export const fetchPaginatedPokemonList = async ({ pageParam = 0 }): Promise<{ results: BasicPokemonData[]; nextOffset: number | undefined; }> => {
  const limit = 50;
  const response = await axios.get<{ results: BasicPokemonData[]; next: string | null; }>(`https://pokeapi.co/api/v2/pokemon?offset=${pageParam}&limit=${limit}`);

  const results = await Promise.all(
    response.data.results.map(async (p) => {
      const pokemonData = await fetchPokemonDetails(p.url);
      const spriteUrl = pokemonData.sprites.front_default ||
                        pokemonData.sprites.other['official-artwork'].front_default ||
                        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`;
      return {
        name: pokemonData.name,
        url: p.url,
        sprite: spriteUrl,
        id: pokemonData.id,
      };
    })
  );

  const nextOffset = response.data.next ? pageParam + limit : undefined;
  return { results, nextOffset };
};

export const fetchAllPokemonNames = async (): Promise<BasicPokemonData[]> => {
  const response = await axios.get<{ results: BasicPokemonData[] }>('https://pokeapi.co/api/v2/pokemon?limit=1300');
  return response.data.results;
};