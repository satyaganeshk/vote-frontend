import React from 'react';
import { VotingProvider } from './context/VotingContext';
import { VotingApp } from './pages/VotingApp';

export const App: React.FC = () => {
  return (
    <VotingProvider>
      <VotingApp />
    </VotingProvider>
  );
};

export default App;
