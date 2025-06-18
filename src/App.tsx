import React, { useState, useEffect} from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import './App.css';
import type { PokemonData } from './types';
import type { BasicPokemonData } from './types';
import { fetchPokemonDetails, fetchPaginatedPokemonList, fetchAllPokemonNames } from './api';
import SearchBox from './components/searchBox/searchBox';
import SearchedPokemonDetails from './components/searchedPokemonDetails/searchedPokemonDetails';
import PokemonTeam from './components/pokemonTeam/pokemonTeam';
import AllPokemonsGrid from './components/allPokemonsGrid/allPokemonsGrid';
import DragStatusBox from './components/dragStatusBox/dragStatusBox'; 
import TeamStatsSummary from './components/teamStatsSummary/teamStatsSummary';


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

    const [teamTotalStats, setTeamTotalStats] = useState<{ [key: string]: number }>({});

   
    const pokemonTeamIds = React.useMemo(() => {
        const ids = new Set(pokemonTeam.filter(p => p !== null && typeof p.id === 'number').map(p => p!.id));
        console.log("Current pokemonTeamIds:", Array.from(ids)); 
        return ids;
    }, [pokemonTeam]);

    
    useEffect(() => {
        console.log("App mounted. Initial pokemonTeam:", pokemonTeam);
        console.log("App mounted. Initial pokemonTeamIds:", Array.from(pokemonTeamIds));
    }, []); 


    const {
        data: allPokemonNamesData,
        isLoading: isLoadingAllNames,
        isError: isErrorAllNames,
        error: errorAllNames
    } = useQuery<BasicPokemonData[], Error>({
        queryKey: ['allPokemonNames'],
        queryFn: fetchAllPokemonNames,
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

    const handleFetchButtonClick = async () => {
        setErrorMessage('');
        setSearchedPokemonDetails(null);

        if (pokemonInput.trim() === '') {
            setErrorMessage("Please enter a Pokémon name to search.");
            return;
        }

        try {
            const details = await fetchPokemonDetails(pokemonInput);
            setSearchedPokemonDetails(details);
        } catch (err) {
            setSearchedPokemonDetails(null);
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setErrorMessage(`Pokémon "${pokemonInput}" not found! Please check the spelling.`);
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
        setErrorMessage('');
        setSearchedPokemonDetails(null);

        try {
            const details = await fetchPokemonDetails(name);
            setSearchedPokemonDetails(details);
        } catch (err) {
            setSearchedPokemonDetails(null);
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setErrorMessage(`Pokémon "${name}" not found!`);
            } else {
                setErrorMessage('Failed to fetch Pokémon details for suggestion. Please try again.');
            }
        } finally {
            setSuggestions([]);
        }
    };

    const handleDragStart = async (e: React.DragEvent<HTMLDivElement>, pokemon: BasicPokemonData) => {
        console.log(`Drag Start: ${pokemon.name} (ID: ${pokemon.id})`);
        
        const isPokemonInTeam = typeof pokemon.id === 'number' && pokemonTeamIds.has(pokemon.id);
        console.log("Does pokemonTeamIds have this pokemon?", isPokemonInTeam);

        
        if (isPokemonInTeam) {
            e.preventDefault(); 
            console.log(`Drag Prevented: ${pokemon.name} (ID: ${pokemon.id}) is already in team.`);
            return;
        }
        setDraggingPokemonBasic(pokemon);
        e.dataTransfer.setData('text/plain', pokemon.name);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
        e.currentTarget.classList.add('pokemon-card'); 

        setCurrentDragPokemonDetails(null);
        try {
            const identifier = pokemon.url || pokemon.name;
            const details = await fetchPokemonDetails(identifier);
            setCurrentDragPokemonDetails(details);
        } catch (error) {
            console.error('Drag Start Error: Failed to load drag status details for DragBox:', error);
            setCurrentDragPokemonDetails(null);
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        console.log('Drag End');
        setDraggingPokemonBasic(null);
        setCurrentDragPokemonDetails(null);
        e.currentTarget.classList.remove('dragging');
        e.currentTarget.classList.remove('pokemon-card');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
        e.currentTarget.classList.add('team-slot');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('drag-over');
        e.currentTarget.classList.remove('team-slot'); 
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        e.currentTarget.classList.remove('team-slot');
        setErrorMessage('');

        const draggedPokemonName = e.dataTransfer.getData('text/plain');
        console.log(`Drop initiated on slot ${slotIndex}`);
        console.log('Dragged Pokemon Name from dataTransfer:', draggedPokemonName);
        console.log('State draggingPokemonBasic:', draggingPokemonBasic);

        if (!draggingPokemonBasic || draggingPokemonBasic.name !== draggedPokemonName) {
            console.warn('Drop failed: No valid Pokémon being dragged or data mismatch.');
            setErrorMessage("No valid Pokémon is being dragged or data mismatch!");
            return;
        }

        if (pokemonTeam[slotIndex] !== null) {
            console.warn(`Drop failed: Slot ${slotIndex} is already occupied by ${pokemonTeam[slotIndex]?.name}.`);
            setErrorMessage("This team slot is already occupied! Please remove the current Pokémon first.");
            return;
        }

        if (typeof draggingPokemonBasic.id === 'number' && pokemonTeamIds.has(draggingPokemonBasic.id)) {
            console.warn(`Drop failed: ${draggingPokemonBasic.name} (ID: ${draggingPokemonBasic.id}) is already in your team.`);
            setErrorMessage(`${draggingPokemonBasic.name} is already in your team!`);
            return;
        }
        


        try {
            console.log(`Attempting to fetch details for dropped Pokemon: ${draggingPokemonBasic.name}`);
            const details = await fetchPokemonDetails(draggingPokemonBasic.name);
            console.log('Pokemon details fetched successfully:', details.name);

            setPokemonTeam((prevTeam) => {
                const newTeam = [...prevTeam];
                newTeam[slotIndex] = details;
                console.log(`Pokemon ${details.name} (ID: ${details.id}) added to slot ${slotIndex}.`);
                console.log("New pokemonTeam state:", newTeam);
                return newTeam;
            });

            setRecentlyDroppedTeamPokemons((prev) => {
                
                if (prev.some(p => p.id === details.id)) {
                    console.log(`${details.name} (ID: ${details.id}) already in recently dropped list.`);
                    return prev;
                }
                const updated = [details, ...prev];
                console.log(`Added ${details.name} (ID: ${details.id}) to recently dropped list.`);
                return updated.slice(0, MAX_RECENTLY_DROPPED);
            });

        } catch (err) {
            console.error('Error during drop operation:', err);
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setErrorMessage(`Could not add ${draggingPokemonBasic.name}: Pokémon not found!`);
            } else {
                if (err instanceof Error) {
                    console.error("Error adding pokemon to team:", err.message);
                } else {
                    console.error("An unknown error occurred while adding pokemon to team.");
                }
                setErrorMessage(`Failed to add ${draggingPokemonBasic.name} to team. Please try again.`);
            }
        }
    };

    const handleTeamSlotClick = (pokemon: PokemonData | null) => {
        if (pokemon) {
            setSelectedPokemonForStats(pokemon);
            setErrorMessage('');
            console.log(`Selected ${pokemon.name} for stats.`);
        } else {
            setSelectedPokemonForStats(null);
            setErrorMessage('This slot is empty!');
            console.log('Clicked empty slot.');
        }
    };

    const handleRemoveFromTeam = (slotIndex: number) => {
        setPokemonTeam((prevTeam) => {
            const newTeam = [...prevTeam];
            const removedPokemon = newTeam[slotIndex];
            newTeam[slotIndex] = null;

            if (selectedPokemonForStats && removedPokemon && selectedPokemonForStats.id === removedPokemon.id) {
                setSelectedPokemonForStats(null);
                console.log(`Removed ${removedPokemon.name} (ID: ${removedPokemon.id}) from slot ${slotIndex} and cleared selected stats.`);
            } else if (removedPokemon) {
                console.log(`Removed ${removedPokemon.name} (ID: ${removedPokemon.id}) from slot ${slotIndex}.`);
            }
            console.log("New pokemonTeam state after removal:", newTeam);
            return newTeam;
        });
        setErrorMessage('');
    };

    const calculateTeamStats = () => {
        const totals: { [key: string]: number } = {};
        pokemonTeam.forEach(pokemon => {
            if (pokemon) {
                pokemon.stats.forEach(stat => {
                    const statName = stat.stat.name;
                    totals[statName] = (totals[statName] || 0) + stat.base_stat;
                });
            }
        });
        setTeamTotalStats(totals);
    };

    useEffect(() => {
        calculateTeamStats();
        console.log('Pokemon team updated, recalculating stats.');
    }, [pokemonTeam]);


    return (
        <div className="App">
            <div className="main-header-section">
                <h1>Welcome to the Universe of Pokemon</h1>
                <p className="description">
                    Here you can find information about your favorite Pokemon, build your team, and view their stats!
                </p>
            </div>

            <div className="centered-search-area">
                <SearchBox
                    pokemonInput={pokemonInput}
                    setPokemonInput={setPokemonInput}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                    handleFetchButtonClick={handleFetchButtonClick}
                    selectPokemonFromSuggestion={selectPokemonFromSuggestion}
                    allPokemonNamesData={allPokemonNamesData}
                    setErrorMessage={setErrorMessage}
                    setSearchedPokemonDetails={setSearchedPokemonDetails}
                />
                {errorMessage && <p className="error-message-global">{errorMessage}</p>}
                {isLoadingAllNames && <p className="loading-message text-gray-400">Loading all Pokémons names for search...</p>}
                {isErrorAllNames && <p className="error-message-global">Error loading all Pokémons names: {errorAllNames?.message}</p>}
                {isLoadingPaginated && !isFetchingNextPage && <p className="loading-message text-gray-400">Loading Pokémons list...</p>}
                {isErrorPaginated && <p className="error-message-global">Error loading Pokémons list: {errorPaginated?.message}</p>}
            </div>

            <div className="main-content-grid-area">
                <div className="left-column-content">
                    <PokemonTeam
                        pokemonTeam={pokemonTeam}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        handleTeamSlotClick={handleTeamSlotClick}
                        handleRemoveFromTeam={handleRemoveFromTeam}
                    />
                    <TeamStatsSummary teamTotalStats={teamTotalStats} />
                </div>

                <div className="right-column-content">
                    <SearchedPokemonDetails
                        pokemon={searchedPokemonDetails}
                        handleDragStart={handleDragStart}
                    />
                    <DragStatusBox
                        draggingPokemonBasic={draggingPokemonBasic}
                        currentDragPokemonDetails={currentDragPokemonDetails}
                        recentlyDroppedTeamPokemons={recentlyDroppedTeamPokemons}
                    />
                    <AllPokemonsGrid
                        displayedPokemonList={displayedPokemonList}
                        isLoadingPaginated={isLoadingPaginated}
                        isFetchingNextPage={isFetchingNextPage}
                        hasNextPage={hasNextPage}
                        fetchNextPage={fetchNextPage}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        pokemonTeamIds={pokemonTeamIds} 
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
