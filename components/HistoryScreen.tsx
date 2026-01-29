
import React from 'react';
import { TestResult } from '../types';
import { Trash2Icon } from './icons';

interface HistoryScreenProps {
  results: TestResult[];
  onBack: () => void;
  onClear: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ results, onBack, onClear }) => {
  return (
    <div className="w-full flex flex-col h-full space-y-6 p-4 bg-gray-850 rounded-lg shadow-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cyan-400">Histórico de Testes</h1>
        {results.length > 0 && (
            <button onClick={onClear} className="p-2 text-red-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors">
                <Trash2Icon className="w-6 h-6" />
            </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 pr-2" style={{maxHeight: '60vh'}}>
        {results.length > 0 ? (
          [...results].reverse().map((result, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold text-white">{result.name}</p>
                    <p className="text-sm text-gray-400">{new Date(result.date).toLocaleString()}</p>
                  </div>
                  <p className="text-lg font-semibold text-cyan-400">VO₂: {result.vo2max.toFixed(2)}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-700 p-2 rounded">
                    <p className="text-xs text-gray-400">Distância</p>
                    <p className="font-medium">{result.distance}m</p>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                    <p className="text-xs text-gray-400">Nível</p>
                    <p className="font-medium">{result.level}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 mt-8">Nenhum resultado salvo ainda.</p>
        )}
      </div>

      <button
        onClick={onBack}
        className="w-full py-5 text-xl font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-300 mt-auto"
      >
        Voltar
      </button>
    </div>
  );
};

export default HistoryScreen;
