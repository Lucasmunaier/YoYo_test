
import React from 'react';
import { TestResult } from '../types';

interface ResultScreenProps {
  results: TestResult[];
  onSave: () => void;
  onNewTest: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ results, onSave, onNewTest }) => {
  return (
    <div className="flex flex-col h-full space-y-6 p-4 bg-gray-850 rounded-lg shadow-2xl" style={{height: 'calc(100vh - 2rem)'}}>
      <h1 className="text-3xl font-bold text-center text-cyan-400">Resultados Finais</h1>

      <div className="w-full flex-grow overflow-y-auto pr-1">
        <div className="w-full text-left">
            <div className="sticky top-0 bg-gray-850 z-10">
                <div className="grid grid-cols-4 border-b border-gray-700 text-gray-400 text-sm p-2 gap-2">
                    <span className="col-span-1 font-semibold">Atleta</span>
                    <span className="text-right font-semibold">Distância</span>
                    <span className="text-right font-semibold">Nível</span>
                    <span className="text-right font-semibold">VO₂ máx</span>
                </div>
            </div>
            <div>
            {[...results].sort((a,b) => b.distance - a.distance).map(result => (
                <div key={result.name} className="grid grid-cols-4 border-b border-gray-800 p-2 items-center gap-2">
                    <span className="font-medium col-span-1 truncate">{result.name}</span>
                    <span className="text-right">{result.distance}m</span>
                    <span className="text-right">{result.level}</span>
                    <span className="text-right text-cyan-400 font-semibold">{result.vo2max.toFixed(2)}</span>
                </div>
            ))}
            </div>
        </div>
      </div>

      <div className="w-full space-y-4 pt-4">
        <button
          onClick={onSave}
          className="w-full py-5 text-xl font-bold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-500 transition-colors duration-300 transform hover:scale-105"
        >
          Salvar e Ver Histórico
        </button>
        <button
          onClick={onNewTest}
          className="w-full py-5 text-xl font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
          Novo Teste
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
