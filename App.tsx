
import React, { useState, useEffect, useCallback } from 'react';
import SetupScreen from './components/SetupScreen';
import TestScreen from './components/TestScreen';
import ResultScreen from './components/ResultScreen';
import HistoryScreen from './components/HistoryScreen';
import { TestResult } from './types';

type Screen = 'setup' | 'testing' | 'results' | 'history';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('setup');
  const [athleteNames, setAthleteNames] = useState<string[]>([]);
  const [lastTestResults, setLastTestResults] = useState<TestResult[]>([]);
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('yoyoTestHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
    }
  }, []);

  const handleTestStart = (names: string[]) => {
    setAthleteNames(names);
    setScreen('testing');
  };

  const handleTestFinish = useCallback((results: TestResult[]) => {
    setLastTestResults(results);
    setScreen('results');
  }, []);

  const handleSaveResult = () => {
    if (lastTestResults.length > 0) {
      const updatedHistory = [...history, ...lastTestResults];
      setHistory(updatedHistory);
      localStorage.setItem('yoyoTestHistory', JSON.stringify(updatedHistory));
    }
    setScreen('history');
  };
  
  const handleViewHistory = () => {
      setScreen('history');
  };

  const handleStartNewTest = () => {
    setAthleteNames([]);
    setLastTestResults([]);
    setScreen('setup');
  };
  
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yoyoTestHistory');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'setup':
        return <SetupScreen onStart={handleTestStart} onViewHistory={handleViewHistory} hasHistory={history.length > 0} />;
      case 'testing':
        return <TestScreen athleteNames={athleteNames} onFinish={handleTestFinish} />;
      case 'results':
        return <ResultScreen results={lastTestResults} onSave={handleSaveResult} onNewTest={handleStartNewTest} />;
      case 'history':
        return <HistoryScreen results={history} onBack={handleStartNewTest} onClear={handleClearHistory} />;
      default:
        return <SetupScreen onStart={handleTestStart} onViewHistory={handleViewHistory} hasHistory={history.length > 0} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
