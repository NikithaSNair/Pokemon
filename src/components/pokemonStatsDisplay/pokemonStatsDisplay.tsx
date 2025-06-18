import React from 'react';
import type { PokemonData } from '../../types'; // Corrected import path

interface PokemonStatsDisplayProps {
    pokemonTeam: Array<PokemonData | null>;
}

const PokemonStatsDisplay: React.FC<PokemonStatsDisplayProps> = ({ pokemonTeam }) => {
    const activePokemonInTeam = pokemonTeam.filter(p => p !== null) as PokemonData[];

    if (activePokemonInTeam.length === 0) {
        return (
            <div
                id="pokemon-stats-display"
                className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center justify-center min-h-[200px] border border-gray-200"
            >
                <h3 className="text-2xl font-bold mb-3 text-gray-800">Team Members' Individual Stats</h3>
                <p className="text-md text-gray-600">
                    Your team is currently empty. Drag and drop Pokémon into your team slots to see their individual stats here!
                </p>
            </div>
        );
    }

    return (
        <div className="team-members-stats-container bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Team Members' Individual Stats</h3>
            <div className="stats-cards-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePokemonInTeam.map((pokemon) => (
                    <div
                        key={pokemon.id}
                        className="pokemon-individual-stats-card bg-gray-50 p-4 rounded-lg shadow-md border border-gray-100 transform transition-transform hover:scale-105"
                    >
                        <h4 className="text-xl font-semibold mb-3 text-blue-700 text-center">
                            {pokemon.name.toUpperCase()}
                        </h4>
                        <div className="stats-grid grid grid-cols-2 gap-2 text-sm">
                            {/* 'stat' parameter type will now be correctly inferred from PokemonData */}
                            {pokemon.stats.map((stat) => (
                                <div key={stat.stat.name} className="stat-item flex justify-between items-center bg-blue-50 px-3 py-2 rounded-md">
                                    <span className="stat-name font-medium text-gray-700">
                                        {stat.stat.name.replace('-', ' ').toUpperCase()}:
                                    </span>
                                    <span className="stat-value font-bold text-blue-800">
                                        {stat.base_stat}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PokemonStatsDisplay;
