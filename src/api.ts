import axios from 'axios';
import type { PokemonData, BasicPokemonData } from './types';

export const fetchPokemonDetails = async (identifier: string): Promise<PokemonData> => {
    const fetchUrl = identifier.startsWith('http')
        ? identifier
        : `https://pokeapi.co/api/v2/pokemon/${identifier.toLowerCase()}`;

    const response = await axios.get<PokemonData>(fetchUrl);
    return response.data;
};

const extractPokemonIdFromUrl = (url: string): number | null => {
    const matches = url.match(/\/pokemon\/(\d+)\//);
    return matches && matches[1] ? parseInt(matches[1], 10) : null;
};

export const fetchPaginatedPokemonList = async ({ pageParam = 0 }): Promise<{ results: BasicPokemonData[]; nextOffset: number | undefined; }> => {
    const limit = 50;
    const response = await axios.get<{ results: BasicPokemonData[]; next: string | null; }>(`https://pokeapi.co/api/v2/pokemon?offset=${pageParam}&limit=${limit}`);

    const results = await Promise.all(
        response.data.results.map(async (p) => {
            try {
                const pokemonData = await fetchPokemonDetails(p.url);
                let id = pokemonData.id;
                if (typeof id !== 'number' || isNaN(id)) {
                    console.warn(`Pokemon ${pokemonData.name} has invalid ID: ${id}. Attempting to extract from URL.`);
                    id = extractPokemonIdFromUrl(p.url) || 0;
                    if (id === 0) {
                        console.error(`Could not determine a valid ID for ${pokemonData.name}. It might not be draggable/droppable correctly.`);
                    }
                }

                const spriteUrl = pokemonData.sprites.front_default ||
                                 pokemonData.sprites.other?.['official-artwork']?.front_default ||
                                 `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

                return {
                    name: pokemonData.name,
                    url: p.url,
                    sprite: spriteUrl,
                    id: id,
                };
            } catch (error) {
                console.error(`Failed to fetch details for ${p.name}:`, error);
                return {
                    name: p.name,
                    url: p.url,
                    sprite: 'https://placehold.co/90x90/E0E0E0/ADADAD?text=Error',
                    id: extractPokemonIdFromUrl(p.url) || Date.now() + Math.random(), 
                };
            }
        })
    );

    const nextOffset = response.data.next ? pageParam + limit : undefined;

    return { results, nextOffset };
};

export const fetchAllPokemonNames = async (): Promise<BasicPokemonData[]> => {
    const response = await axios.get<{ results: BasicPokemonData[] }>('https://pokeapi.co/api/v2/pokemon?limit=1300');
    return response.data.results;
};
