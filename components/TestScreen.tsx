
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { YOYO_IR1_LEVELS, REST_PERIOD_SECONDS } from '../constants';
import { ShieldAlertIcon } from './icons';
import { useBeep } from '../hooks/useBeep';
import { TestResult } from '../types';

interface AthleteState {
  name: string;
  warnings: number;
  status: 'active' | 'finished';
  result: TestResult | null;
}

interface TestScreenProps {
  athleteNames: string[];
  onFinish: (results: TestResult[]) => void;
}

type TestStatus = 'initial' | 'running' | 'resting';

const TestScreen: React.FC<TestScreenProps> = ({ athleteNames, onFinish }) => {
  const [status, setStatus] = useState<TestStatus>('initial');
  const [stageIndex, setStageIndex] = useState(0);
  const [countdown, setCountdown] = useState(5); // Increased for group setup
  const playBeep = useBeep();
  
  const [athletes, setAthletes] = useState<AthleteState[]>(() => 
    athleteNames.map(name => ({
      name,
      warnings: 0,
      status: 'active',
      result: null,
    }))
  );

  const activeAthletes = useMemo(() => athletes.filter(a => a.status === 'active'), [athletes]);
  const finishedAthletes = useMemo(() => athletes.filter(a => a.status === 'finished'), [athletes]);

  const currentStage = YOYO_IR1_LEVELS[stageIndex];
  const shuttleTime = useMemo(() => {
    return currentStage ? currentStage.shuttleTime * 2 : 0;
  }, [currentStage]);

  // Effect to end test when no athletes are active
  useEffect(() => {
    if (status !== 'initial' && activeAthletes.length === 0) {
      const finalResults = athletes.map(a => a.result).filter((r): r is TestResult => r !== null);
      onFinish(finalResults);
    }
  }, [activeAthletes.length, athletes, onFinish, status]);

  const finishAllTest = useCallback(() => {
    const finalResults = athletes.map(a => {
      if (a.result) return a.result; // Already finished
      
      const prevStage = stageIndex > 0 ? YOYO_IR1_LEVELS[stageIndex - 1] : null;
      const distance = prevStage ? prevStage.cumulativeDistance : 0;
      const level = prevStage ? prevStage.level : "Início";
      const vo2max = distance * 0.0084 + 36.4;
      return { name: a.name, distance, level, vo2max, date: new Date().toISOString() };
    }).filter((r): r is TestResult => r !== null);

    onFinish(finalResults);
  }, [athletes, stageIndex, onFinish]);

  // Initial countdown effect
  useEffect(() => {
    if (status === 'initial' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'initial' && countdown === 0) {
      setStatus('running');
      setCountdown(shuttleTime);
      playBeep();
    }
  }, [status, countdown, shuttleTime, playBeep]);

  // Main test timer effect
  useEffect(() => {
    if (status !== 'running' && status !== 'resting') return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (status === 'running') {
            setStatus('resting');
            playBeep();
            return REST_PERIOD_SECONDS;
          } else { // resting
            if (stageIndex + 1 >= YOYO_IR1_LEVELS.length) {
              finishAllTest();
              return 0;
            }
            setStageIndex(i => i + 1);
            setStatus('running');
            playBeep();
            return YOYO_IR1_LEVELS[stageIndex + 1].shuttleTime * 2;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, stageIndex, playBeep, finishAllTest]);
  
  const handleWarning = (athleteName: string) => {
    const athlete = athletes.find(a => a.name === athleteName);
    if (!athlete || athlete.status === 'finished') return;

    if (athlete.warnings === 0) {
      setAthletes(prev => prev.map(a => a.name === athleteName ? {...a, warnings: 1} : a));
    } else {
      const prevStage = stageIndex > 0 ? YOYO_IR1_LEVELS[stageIndex-1] : null;
      const distance = prevStage ? prevStage.cumulativeDistance : 0;
      const level = prevStage ? prevStage.level : "Início";
      const vo2max = distance * 0.0084 + 36.4;
      const result: TestResult = { name: athleteName, distance, level, vo2max, date: new Date().toISOString() };
      
      setAthletes(prev => prev.map(a => a.name === athleteName ? { ...a, status: 'finished', result } : a));
    }
  };

  const getTimerColor = () => {
    if (status === 'resting') return 'bg-blue-500';
    if (!shuttleTime) return 'bg-gray-600';
    const percentage = countdown / shuttleTime;
    if (percentage > 0.4) return 'bg-green-600';
    if (percentage > 0.2) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  if (status === 'initial') {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-semibold text-gray-300">Preparar!</h2>
            <p className="text-9xl font-bold text-cyan-400">{countdown}</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3" style={{height: 'calc(100vh - 2rem)'}}>
      <div className={`w-full h-24 flex items-center justify-center rounded-lg transition-colors duration-500 ${getTimerColor()}`}>
        <p className="text-5xl font-bold">
            {status === 'resting' ? `Repouso: ${Math.round(countdown)}` : Math.round(countdown)}
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">Nível</p>
          <p className="text-xl font-bold">{currentStage?.level || '---'}</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">Velocidade</p>
          <p className="text-xl font-bold">{currentStage?.speed || '---'} km/h</p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">Distância</p>
          <p className="text-xl font-bold">{currentStage?.cumulativeDistance || '---'} m</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 pr-1 pb-2">
        <h3 className="text-lg font-semibold text-gray-300 sticky top-0 bg-gray-900 py-1">Atletas Ativos ({activeAthletes.length})</h3>
        {activeAthletes.map(athlete => (
          <div key={athlete.name} className={`flex items-center justify-between p-3 rounded-lg ${athlete.warnings > 0 ? 'bg-yellow-900/60' : 'bg-gray-800'}`}>
            <span className="font-medium text-lg">{athlete.name}</span>
            <button 
              onClick={() => handleWarning(athlete.name)}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105 ${athlete.warnings === 0 ? 'bg-yellow-500 text-black' : 'bg-orange-500 text-white'}`}
            >
              <ShieldAlertIcon className="w-5 h-5"/>
              <span>Aviso {athlete.warnings > 0 ? `(1)`: ''}</span>
            </button>
          </div>
        ))}

        {finishedAthletes.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-gray-300 sticky top-0 bg-gray-900 py-1 mt-3">Finalizados ({finishedAthletes.length})</h3>
            {[...finishedAthletes].sort((a, b) => (b.result?.distance || 0) - (a.result?.distance || 0)).map(athlete => (
              <div key={athlete.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 text-gray-400">
                <span className="font-medium">{athlete.name}</span>
                <span className="font-semibold">{athlete.result?.distance}m - Nível {athlete.result?.level}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <button
        onClick={finishAllTest}
        className="py-5 text-xl font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-300 transform hover:scale-105"
      >
        Parar Teste para Todos
      </button>
    </div>
  );
};

export default TestScreen;
