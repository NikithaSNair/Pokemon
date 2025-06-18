import type { PokemonData, BasicPokemonData } from '../../types';
import { typeColors } from '../../utils/pokemonTypeColors';

interface SearchedPokemonDetailsProps {
  pokemon: PokemonData | null;
  handleDragStart?: (e: React.DragEvent<HTMLDivElement>, pokemon: BasicPokemonData) => void;
}

const SearchedPokemonDetails: React.FC<SearchedPokemonDetailsProps> = ({ pokemon, handleDragStart }) => {
  if (!pokemon) {
    return null;
  }

  const pokemonTypeName = pokemon.types?.[0]?.type?.name;
  const bgColor = pokemonTypeName ? typeColors[pokemonTypeName] : '#28a745';

  return (
    <div id="searched-pokemon-details">
      <h2 style={{ backgroundColor: bgColor }}>
        {pokemon.name.toUpperCase()}
      </h2>
      <div className="sprite-box">
        <img
          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
          alt={pokemon.name}
        />
      </div>
      <div
        className="drag-handle"
        draggable={!!handleDragStart}
        onDragStart={handleDragStart ? (e) => handleDragStart(e, { name: pokemon.name, url: `https://pokeapi.co/api/v2/pokemon/${pokemon.name}/` }) : undefined}
        onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
        style={{ cursor: 'grab', textAlign: 'center', margin: '10px 0' }}
      >
        <span className="drag-icon">⋮⋮ Drag this Pokémon</span>
      </div>
      <p><strong>Height:</strong> {pokemon.height / 10} m</p>
      <p><strong>Weight:</strong> {pokemon.weight / 10} kg</p>
      <p><strong>Base Exp:</strong> {pokemon.base_experience}</p>
      <p>
        <strong>Types:</strong> {pokemon.types.map((t) => t.type.name).join(', ')}
      </p>
    </div>
  );
};

export default SearchedPokemonDetails;
