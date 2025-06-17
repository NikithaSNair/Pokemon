import type{ BasicPokemonData } from '../types'; 
import type { InfiniteQueryObserverResult } from '@tanstack/react-query';

interface AllPokemonsGridProps {
  displayedPokemonList: BasicPokemonData[];
  isLoadingPaginated: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => Promise<InfiniteQueryObserverResult>;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, pokemon: BasicPokemonData) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const AllPokemonsGrid: React.FC<AllPokemonsGridProps> = ({
  displayedPokemonList,
  isLoadingPaginated,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  handleDragStart,
  handleDragEnd,
}) => {
  return (
    <div className="all-pokemons-section">
      <h2>Our Collections</h2>
      {isLoadingPaginated && <p>Oops! Loading Pokémons...</p>}
      <div className="pokemon-grid">
        {displayedPokemonList.map((pokemon) => (
          <div
            key={pokemon.name}
            className="pokemon-card"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, pokemon)}
            onDragEnd={handleDragEnd}
          >
            <img src={pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={pokemon.name} />
            <p>{pokemon.name.toUpperCase()}</p>
          </div>
        ))}
      </div>
      {hasNextPage && (
        <button className="load-more-btn" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading more...wait please' : 'You wanna see more Pokémons?'}
        </button>
      )}
    </div>
  );
};

export default AllPokemonsGrid;