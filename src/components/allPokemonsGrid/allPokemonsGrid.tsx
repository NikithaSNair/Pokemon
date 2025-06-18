import React from 'react';
import type { BasicPokemonData } from '../../types';
import type { InfiniteQueryObserverResult } from '@tanstack/react-query';

interface AllPokemonsGridProps {
    displayedPokemonList: BasicPokemonData[];
    isLoadingPaginated: boolean;
    isFetchingNextPage: boolean;
    isErrorPaginated?: boolean;
    errorPaginated?: Error;
    hasNextPage: boolean | undefined;
    fetchNextPage: () => Promise<InfiniteQueryObserverResult>;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, pokemon: BasicPokemonData) => void;
    handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    pokemonTeamIds: Set<number>; 
}

const AllPokemonsGrid: React.FC<AllPokemonsGridProps> = ({
    displayedPokemonList,
    isLoadingPaginated,
    isFetchingNextPage,
    isErrorPaginated,
    errorPaginated,
    hasNextPage,
    fetchNextPage,
    handleDragStart,
    handleDragEnd,
    pokemonTeamIds,
}) => {
    if (isErrorPaginated) {
        return <p className="error-message-global">Error loading Pokémons: {errorPaginated?.message}</p>;
    }

    return (
        <div className="all-pokemons-section">
            <h2>Our Collections</h2>
            {isLoadingPaginated && !isFetchingNextPage && <p className="loading-message text-gray-400">Oops! Loading Pokémons...</p>}

            <div className="pokemon-grid">
                {displayedPokemonList.map((pokemon) => {
                    const isInTeam = typeof pokemon.id === 'number' && !isNaN(pokemon.id) && pokemonTeamIds.has(pokemon.id);

                    return (
                        <div
                            key={pokemon.id || pokemon.name} 
                            className={`pokemon-card ${isInTeam ? 'in-team' : ''}`}
                            draggable={!isInTeam ? "true" : "false"}
                            onDragStart={!isInTeam ? (e) => handleDragStart(e, pokemon) : undefined}
                            onDragEnd={!isInTeam ? handleDragEnd : undefined}
                            style={{ cursor: isInTeam ? 'not-allowed' : 'grab' }}
                        >
                            <img
                                src={pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                alt={pokemon.name}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/90x90/E0E0E0/ADADAD?text=No+Image';
                                    e.currentTarget.alt = 'Image not available';
                                }}
                            />
                            <p>{pokemon.name.toUpperCase()}</p>
                        </div>
                    );
                })}
            </div>
            {hasNextPage && (
                <div className="flex justify-center mt-8">
                    <button
                        className="load-more-btn"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Loading more... please wait' : 'You wanna see more Pokémons?'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllPokemonsGrid;
