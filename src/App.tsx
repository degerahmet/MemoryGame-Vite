import React, { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Generate card pairs
const generateCards = () => {
  const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯'];
  const cards: Card[] = [...emojis, ...emojis].map((emoji, index) => ({
    id: index,
    value: emoji,
    isFlipped: false,
    isMatched: false
  }));
  return shuffleCards(cards);
};

// Shuffle cards
const shuffleCards = (cards: Card[]) => {
  return [...cards].sort(() => Math.random() - 0.5);
};

function App() {
  // Game state
  const [cards, setCards] = useState<Card[]>(() => {
    const savedCards = sessionStorage.getItem('gameCards');
    return savedCards ? JSON.parse(savedCards) : generateCards();
  });
  
  const [moves, setMoves] = useState(() => {
    const savedMoves = sessionStorage.getItem('gameMoves');
    return savedMoves ? parseInt(savedMoves) : 0;
  });

  const [totalMoves, setTotalMoves] = useState(() => {
    const savedTotalMoves = localStorage.getItem('totalMoves');
    return savedTotalMoves ? parseInt(savedTotalMoves) : 0;
  });

  const [selectedCards, setSelectedCards] = useState<number[]>(() => {
    const savedSelected = sessionStorage.getItem('selectedCards');
    return savedSelected ? JSON.parse(savedSelected) : [];
  });

  // Save game state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('gameCards', JSON.stringify(cards));
    sessionStorage.setItem('gameMoves', moves.toString());
    sessionStorage.setItem('selectedCards', JSON.stringify(selectedCards));
  }, [cards, moves, selectedCards]);

  // Save total moves to localStorage
  useEffect(() => {
    localStorage.setItem('totalMoves', totalMoves.toString());
  }, [totalMoves]);

  // Check for game completion
  useEffect(() => {
    if (cards.every(card => card.isMatched)) {
      alert(`Congratulations! You completed the game in ${moves} moves.`);
      resetGame();
    }
  }
  , [cards, moves]);


  const handleCardClick = (index: number) => {
    if (selectedCards.length === 2 || cards[index].isMatched || cards[index].isFlipped) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);
    
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      const newMoves = moves + 1;
      setMoves(newMoves);
      setTotalMoves(prev => prev + 1);

      if (cards[first].value === cards[second].value) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setSelectedCards([]);
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(generateCards());
    setMoves(0);
    setSelectedCards([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Memory Game</h1>
              <p className="text-gray-600">Current Moves: {moves}</p>
              <p className="text-gray-600">Total Moves (All Games): {totalMoves}</p>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Shuffle size={20} />
              New Game
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square text-4xl flex items-center justify-center rounded-lg transition-all transform hover:scale-105
                  ${card.isFlipped || card.isMatched 
                    ? 'bg-white border-2 border-blue-500' 
                    : 'bg-blue-500 text-white'}`}
              >
                {(card.isFlipped || card.isMatched) ? card.value : '?'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;