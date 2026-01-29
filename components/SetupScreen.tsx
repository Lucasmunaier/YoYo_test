
import React, { useState, KeyboardEvent } from 'react';
import { HistoryIcon, XIcon, UserPlusIcon } from './icons';
import { unlockBeep } from '../hooks/useBeep';

interface SetupScreenProps {
  onStart: (names: string[]) => void;
  onViewHistory: () => void;
  hasHistory: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onViewHistory, hasHistory }) => {
  const [nameInput, setNameInput] = useState('');
  const [names, setNames] = useState<string[]>([]);

  const handleAddName = () => {
    const trimmedName = nameInput.trim();
    if (trimmedName && !names.find(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      setNames([...names, trimmedName]);
      setNameInput('');
    }
  };

  const handleRemoveName = (nameToRemove: string) => {
    setNames(names.filter(name => name !== nameToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddName();
    }
  };

  const handleStart = () => {
    if (names.length > 0) {
      unlockBeep();
      onStart(names);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-4 bg-gray-850 rounded-lg shadow-2xl">
      <h1 className="text-3xl font-bold text-center text-cyan-400">Yo-Yo Intermittent Recovery Test</h1>
      
      <div className="w-full">
        <label htmlFor="athleteName" className="block text-sm font-medium text-gray-300 mb-2">Adicionar Atletas</label>
        <div className="flex">
            <input
              id="athleteName"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite o nome aqui"
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <button onClick={handleAddName} className="p-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-r-lg flex items-center">
                <UserPlusIcon className="w-6 h-6"/>
            </button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 min-h-[40px]">
            {names.map(name => (
                <div key={name} className="bg-gray-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{name}</span>
                    <button onClick={() => handleRemoveName(name)} className="text-gray-300 hover:text-white">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={names.length === 0}
        className="w-full py-6 text-2xl font-bold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        Iniciar Teste ({names.length})
      </button>

      {hasHistory && (
         <button
         onClick={onViewHistory}
         className="w-full flex items-center justify-center gap-2 py-4 text-lg font-semibold text-cyan-400 bg-transparent border-2 border-cyan-400 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-300"
       >
         <HistoryIcon className="w-6 h-6" />
         Ver Histórico
       </button>
      )}
    </div>
  );
};

export default SetupScreen;
