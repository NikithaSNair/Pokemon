import React from 'react';
import type { BasicPokemonData, PokemonData } from '../types';

interface DragStatusBoxProps {
  draggingPokemonBasic: BasicPokemonData | null;
  currentDragPokemonDetails: PokemonData | null;
  recentlyDroppedTeamPokemons: PokemonData[];
  //MAX_RECENTLY_DROPPED: number; same samee
}

const DragStatusBox: React.FC<DragStatusBoxProps> = ({
  draggingPokemonBasic,
  currentDragPokemonDetails,
  recentlyDroppedTeamPokemons,
 //MAX_RECENTLY_DROPPED, removed -- handled in App.tsx 
}) => {
  if (!draggingPokemonBasic) {
    return null;
  }

  return (
    <div className="drag-status-box">
      {!currentDragPokemonDetails ? (
        <p>Loading {draggingPokemonBasic.name} details...</p>
      ) : (
        <>
          <h4>Dragging: {currentDragPokemonDetails.name.toUpperCase()}</h4>
          <img
            src={
              currentDragPokemonDetails.sprites.front_default ||
              currentDragPokemonDetails.sprites.other['official-artwork'].front_default ||
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentDragPokemonDetails.id}.png`
            }
            alt={currentDragPokemonDetails.name}
          />
          <div className="drag-stats-preview">
            {currentDragPokemonDetails.stats.slice(0, 3).map(stat => (
              <span key={stat.stat.name}>{stat.stat.name.replace('-', ' ').toUpperCase()}: {stat.base_stat}</span>
            ))}
          </div>

          {recentlyDroppedTeamPokemons.length > 0 && (
            <div className="recently-dropped-section">
              <h5>Recently Added to Team:</h5>
              <div className="recently-dropped-list">
                {recentlyDroppedTeamPokemons.map(p => (
                  <div key={p.id} className="recent-pokemon-item">
                    <img src={p.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.name} />
                    <span>{p.name.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DragStatusBox;