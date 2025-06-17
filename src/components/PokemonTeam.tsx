import type { PokemonData} from '../types'; 

interface PokemonTeamProps {
  pokemonTeam: Array<PokemonData | null>;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => void;
  handleTeamSlotClick: (pokemon: PokemonData | null) => void;
  handleRemoveFromTeam: (slotIndex: number) => void;
}

const PokemonTeam: React.FC<PokemonTeamProps> = ({
  pokemonTeam,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleTeamSlotClick,
  handleRemoveFromTeam,
}) => {
  return (
    <div className="pokemon-team-section">
      <h2>Your Pokémon Team</h2>
      <div className="pokemon-team-slots">
        {pokemonTeam.map((pokemon, index) => (
          <div
            key={index}
            className={`team-slot ${pokemon ? 'occupied' : 'empty'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleTeamSlotClick(pokemon)}
          >
            {pokemon ? (
              <>
                <img src={pokemon.sprites.front_default || pokemon.sprites.other['official-artwork'].front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={pokemon.name} />
                <span>{pokemon.name.toUpperCase()}</span>
                <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleRemoveFromTeam(index); }}>&times;</button>
              </>
            ) : (
              <span>Drop me Here!</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonTeam;