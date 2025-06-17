// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios'; 
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import './App.css'; 

interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}


interface PokemonSprites {
  front_default: string | null; 
  back_default: string | null; 
  other: {
    'official-artwork': {
      front_default: string | null; 
    };
  };
}


interface PokemonStat {
  base_stat: number;
  effort: number; 
  stat: {
    name: string; 
    url: string;
  };
}



interface BasicPokemonData {
  name: string;
  url: string; 
  sprite?: string; 
  id?: number; 
}

interface PokemonData extends BasicPokemonData {
  id: number; 
  height: number; 
  weight: number; 
  base_experience: number;
  types: PokemonType[];
  sprites: PokemonSprites;
  stats: PokemonStat[]; 
}


const typeColors: { [key: string]: string } = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
  psychic: '#F85888', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848',
  fairy: '#EE99AC', normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
  poison: '#A040A0', ground: '#E0C068', rock: '#B8A038', bug: '#A8B820',
  ghost: '#705898', steel: '#B8B8D0',
};


const fetchPokemonDetails = async (identifier: string): Promise<PokemonData> => {
  const fetchUrl = identifier.startsWith('http')
    ? identifier
    : `https://pokeapi.co/api/v2/pokemon/${identifier.toLowerCase()}`;
  const response = await axios.get<PokemonData>(fetchUrl);
  return response.data;
};


const fetchPaginatedPokemonList = async ({ pageParam = 0 }): Promise<{ results: BasicPokemonData[]; nextOffset: number | undefined; }> => {
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


function App() {
  
  const [pokemonInput, setPokemonInput] = useState<string>('');
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [searchedPokemonDetails, setSearchedPokemonDetails] = useState<PokemonData | null>(null);
 
  const [errorMessage, setErrorMessage] = useState<string>('');

  
  const [pokemonTeam, setPokemonTeam] = useState<Array<PokemonData | null>>(Array(6).fill(null));
  const [selectedPokemonForStats, setSelectedPokemonForStats] = useState<PokemonData | null>(null);

  
  const [draggingPokemonBasic, setDraggingPokemonBasic] = useState<BasicPokemonData | null>(null);
  const [currentDragPokemonDetails, setCurrentDragPokemonDetails] = useState<PokemonData | null>(null);
  const [recentlyDroppedTeamPokemons, setRecentlyDroppedTeamPokemons] = useState<PokemonData[]>([]);
  const MAX_RECENTLY_DROPPED = 3;

  
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const { data: allPokemonNamesData, isLoading: isLoadingAllNames, isError: isErrorAllNames, error: errorAllNames } = useQuery<BasicPokemonData[], Error>({
    queryKey: ['allPokemonNames'],
    queryFn: async () => {
      const response = await axios.get<{ results: BasicPokemonData[] }>('https://pokeapi.co/api/v2/pokemon?limit=1300');
      return response.data.results;
    },
    staleTime: Infinity, 
  });

  
  const {
    data: paginatedPokemonData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPaginated,
    isError: isErrorPaginated,
    error: errorPaginated,
  } = useInfiniteQuery({
    queryKey: ['paginatedPokemonList'],
    queryFn: fetchPaginatedPokemonList,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  });

  
  const displayedPokemonList = paginatedPokemonData?.pages.flatMap(page => page.results) || [];

  
  useEffect(() => {
   
    const handleClickOutside = (event: MouseEvent) => {
      
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
   
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); 


  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setPokemonInput(e.target.value);
    setErrorMessage('');
    setSearchedPokemonDetails(null);

    if (query.length > 0 && allPokemonNamesData) { 
      const matches = allPokemonNamesData
        .filter((p) => p.name.toLowerCase().includes(query))
        .map(p => p.name)
        .slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleFetchButtonClick = async () => {
    if (pokemonInput.trim() === '') {
        setErrorMessage("Please enter a Pokémon name.");
        setSearchedPokemonDetails(null);
        return;
    }
    try {
      const details = await fetchPokemonDetails(pokemonInput);
      setSearchedPokemonDetails(details);
      setErrorMessage('');
    } catch (err) {
      setSearchedPokemonDetails(null);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setErrorMessage('Pokémon not found!');
      } else {
        setErrorMessage('Failed to fetch Pokémon details. Please try again.');
      }
    } finally {
      setSuggestions([]);
    }
  };

  const selectPokemonFromSuggestion = async (name: string) => {
    setPokemonInput(name);
    setSuggestions([]);
    try {
      const details = await fetchPokemonDetails(name);
      setSearchedPokemonDetails(details);
      setErrorMessage('');
    } catch (err) {
      setSearchedPokemonDetails(null);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setErrorMessage('Pokémon not found!');
      } else {
        setErrorMessage('Failed to fetch Pokémon details. Please try again.');
      }
    }
  };

  
  const handleDragStart = async (e: React.DragEvent<HTMLDivElement>, pokemon: BasicPokemonData) => {
    setDraggingPokemonBasic(pokemon);
    e.dataTransfer.setData('text/plain', pokemon.name); 
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging'); 

    setCurrentDragPokemonDetails(null); 
    try {
     
      const identifier = pokemon.url || pokemon.name;
      const details = await fetchPokemonDetails(identifier);
      setCurrentDragPokemonDetails(details); 
    } catch (error) {
      console.error('Failed to load drag status details:', error);
      
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggingPokemonBasic(null); 
    setCurrentDragPokemonDetails(null); 
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move'; 
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    setErrorMessage(''); 

    
    if (draggingPokemonBasic && pokemonTeam[slotIndex] === null) {
      try {
        const details = await fetchPokemonDetails(draggingPokemonBasic.name);
        setPokemonTeam((prevTeam) => {
          const newTeam = [...prevTeam];
          newTeam[slotIndex] = details; 
          return newTeam;
        });
        setSelectedPokemonForStats(details); 

        
        setRecentlyDroppedTeamPokemons((prev) => {
          
          if (prev.some(p => p.id === details.id)) {
            return prev;
          }
          const updated = [details, ...prev]; 
          return updated.slice(0, MAX_RECENTLY_DROPPED); 
        });

      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setErrorMessage(`Could not add ${draggingPokemonBasic.name}: Pokémon not found!`);
        } else {
          setErrorMessage(`Failed to add ${draggingPokemonBasic.name} to team. Please try again.`);
        }
      }
    } else if (pokemonTeam[slotIndex] !== null) {
      setErrorMessage("Slot is already occupied!");
    } else if (!draggingPokemonBasic) {
      setErrorMessage("No Pokémon is being dragged!");
    }
    setDraggingPokemonBasic(null); 
    setCurrentDragPokemonDetails(null); 
  };

  const handleTeamSlotClick = (pokemon: PokemonData | null) => {
    if (pokemon) {
      setSelectedPokemonForStats(pokemon);
      setErrorMessage(''); 
    } else {
      setSelectedPokemonForStats(null); 
    }
  };

  const handleRemoveFromTeam = (slotIndex: number) => {
    setPokemonTeam((prevTeam) => {
      const newTeam = [...prevTeam];
      const removedPokemon = newTeam[slotIndex];
      newTeam[slotIndex] = null;
      
      if (selectedPokemonForStats && removedPokemon && selectedPokemonForStats.id === removedPokemon.id) {
        setSelectedPokemonForStats(null);
      }
      return newTeam;
    });
    setErrorMessage(''); 
  };


  
  return (
    <div className="App">
     
      <h1>Welcome to the Pokemon Page</h1>
      <p className="description">Here you can find information about your favorite Pokemon, build your team, and view their stats!</p>

      
      <div className="search-wrapper" ref={searchWrapperRef}>
        <div className="search-container">
          <input
            type="text"
            id="pokemon-input"
            placeholder="Search Pokémon..."
            autoComplete="off"
            value={pokemonInput}
            onChange={handleInputChange}
            onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    handleFetchButtonClick();
                }
            }}
          />
          <button id="fetch-button" onClick={handleFetchButtonClick}>
            Fetch Pokemon
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul id="suggestions">
            {suggestions.map((name) => (
              <li key={name} onClick={() => selectPokemonFromSuggestion(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      
      {errorMessage && <p className="error-message-global">{errorMessage}</p>}
      {isErrorAllNames && <p className="error-message-global">Error loading all Pokémon names: {errorAllNames?.message}</p>}
      {isErrorPaginated && <p className="error-message-global">Error loading Pokémon list: {errorPaginated?.message}</p>}


     
      {draggingPokemonBasic && (
        <div className="drag-status-box">
          {!currentDragPokemonDetails ? (
            <p>Loading {draggingPokemonBasic.name} details...</p>
          ) : (
            <>
              <h4>Dragging: {currentDragPokemonDetails.name.toUpperCase()}</h4>
              <img src={currentDragPokemonDetails.sprites.front_default || currentDragPokemonDetails.sprites.other['official-artwork'].front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentDragPokemonDetails.id}.png`} alt={currentDragPokemonDetails.name} />
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
      )}


      
      {searchedPokemonDetails && (
        <div id="searched-pokemon-details">
          <h2 style={{ backgroundColor: typeColors[searchedPokemonDetails.types[0].type.name] || '#28a745' }}>
            {searchedPokemonDetails.name.toUpperCase()}
          </h2>
          <div className="sprite-box">
            <img
              src={searchedPokemonDetails.sprites.other['official-artwork'].front_default || searchedPokemonDetails.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${searchedPokemonDetails.id}.png`}
              alt={searchedPokemonDetails.name}
            />
          </div>
          <p><strong>Height:</strong> {searchedPokemonDetails.height / 10} m</p>
          <p><strong>Weight:</strong> {searchedPokemonDetails.weight / 10} kg</p>
          <p><strong>Base Exp:</strong> {searchedPokemonDetails.base_experience}</p>
          <p>
            <strong>Types:</strong> {searchedPokemonDetails.types.map((t) => t.type.name).join(', ')}
          </p>
        </div>
      )}


      
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
                <span>Drop Pokémon Here!</span>
              )}
            </div>
          ))}
        </div>
      </div>

      
      {selectedPokemonForStats && (
        <div className="pokemon-stats-bar">
          <h3>{selectedPokemonForStats.name.toUpperCase()} Stats</h3>
          <div className="stats-grid">
            {selectedPokemonForStats.stats.map((stat) => (
              <div key={stat.stat.name} className="stat-item">
                <span className="stat-name">{stat.stat.name.replace('-', ' ').toUpperCase()}:</span>
                <span className="stat-value">{stat.base_stat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

     
      <div className="all-pokemons-section">
        <h2>All Pokémons</h2>
        {(isLoadingAllNames || isLoadingPaginated) && <p>Loading Pokémons...</p>}
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
            {isFetchingNextPage ? 'Loading more...' : 'Load More Pokémons'}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
