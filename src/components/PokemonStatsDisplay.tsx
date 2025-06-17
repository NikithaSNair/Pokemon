import type { PokemonData } from '../types'; 

interface PokemonStatsDisplayProps {
  pokemonTeam: Array<PokemonData | null>; 
}

const PokemonStatsDisplay: React.FC<PokemonStatsDisplayProps> = ({ pokemonTeam }) => {
  console.log('PokemonStatsDisplay: Received pokemonTeam prop:', pokemonTeam); 

  
  const activePokemonInTeam = pokemonTeam.filter(p => p !== null) as PokemonData[];

  if (activePokemonInTeam.length === 0) {
    return (
      <div id="pokemon-stats-display" className="placeholder-stats-multiple">
        <h3>Team Members' Individual Stats</h3>
        <p>Your team is currently empty. Drag and drop Pokémon into your team slots to see their individual stats here!</p>
      </div>
    );
  }

  return (
    <div className="team-members-stats-container">
      <h3>Team Members' Individual Stats</h3>
      <div className="stats-cards-grid"> 
        {activePokemonInTeam.map((pokemon) => (
          <div key={pokemon.id} className="pokemon-individual-stats-card">
            <h4>{pokemon.name.toUpperCase()}</h4>
            <div className="stats-grid"> //for reuse(later) 
              {pokemon.stats.map((stat) => (
                <div key={stat.stat.name} className="stat-item">
                  <span className="stat-name">{stat.stat.name.replace('-', ' ').toUpperCase()}:</span>
                  <span className="stat-value">{stat.base_stat}</span>
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