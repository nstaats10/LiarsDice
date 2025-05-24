// Game logic utilities for Liar's Dice

interface Bid {
  quantity: number;
  value: number;
  score?: number;
}

/**
 * Evaluates whether a bid is accurate based on all dice in play
 */
export function evaluateBid(allDice: number[], bid: Bid): { bidSucceeded: boolean; actualCount: number } {
  const actualCount = allDice.filter(d => d === bid.value).length;
  return {
    bidSucceeded: actualCount >= bid.quantity,
    actualCount
  };
}

/**
 * AI decision-making logic for determining whether to call bluff or make a bid
 */
export function calculateAIMove(
  aiDice: number[],
  totalDiceCount: number,
  currentBid: Bid | null
): { callBluff: boolean; quantity: number; value: number } {
  // If there's no current bid, make an initial bid
  if (!currentBid) {
    // Count frequencies of each dice value
    const valueCounts: Record<number, number> = {};
    aiDice.forEach(d => {
      valueCounts[d] = (valueCounts[d] || 0) + 1;
    });
    
    // Find most common value in AI's dice
    let maxCount = 0;
    let maxValue = 1;
    
    for (const [value, count] of Object.entries(valueCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxValue = parseInt(value);
      }
    }
    
    // Be more aggressive with initial bid based on dice count
    const initialMultiplier = Math.floor((aiDice.length / totalDiceCount) * 2) + 1;
    return {
      callBluff: false,
      quantity: Math.max(1, maxCount * initialMultiplier),
      value: maxValue
    };
  }
  
  // Evaluate the current bid
  const { quantity, value } = currentBid;
  const aiCount = aiDice.filter(d => d === value).length;
  const otherValues = aiDice.filter(d => d !== value).length;
  
  // Estimate probability of bid being true
  const unknownDice = totalDiceCount - aiDice.length;
  const remainingNeeded = quantity - aiCount;
  
  // Calculate probability using binomial distribution
  const probBidTrue = calculateBidProbability(remainingNeeded, unknownDice);
  
  // Calculate confidence level based on AI's dice
  const confidenceLevel = calculateConfidenceLevel(aiDice, quantity, value);
  
  // Decision thresholds based on confidence and probability
  const bluffThreshold = 0.3 + (confidenceLevel * 0.2);  // Adjust based on confidence
  const bluffChance = Math.random();
  
  // Decide whether to call bluff
  if (probBidTrue < bluffThreshold && bluffChance < 0.8) {
    return { callBluff: true, quantity: 0, value: 0 };
  }
  
  // Make a new bid
  // Find the most common value in AI's dice
  const valueCounts: Record<number, number> = {};
  aiDice.forEach(d => {
    valueCounts[d] = (valueCounts[d] || 0) + 1;
  });
  
  // Analyze potential bids
  const potentialBids = analyzePotentialBids(valueCounts, quantity, value, aiDice.length);
  
  // Choose the best bid based on probability and confidence
  const bestBid = potentialBids.reduce((best, bid) => {
    const bidProb = calculateBidProbability(
      bid.quantity - aiDice.filter(d => d === bid.value).length,
      unknownDice
    );
    const bidConfidence = calculateConfidenceLevel(aiDice, bid.quantity, bid.value);
    
    const bidScore = (bidProb * 0.6) + (bidConfidence * 0.4);
    
    return bidScore > best.score ? { ...bid, score: bidScore } : best;
  }, { quantity: 0, value: 0, score: 0 } as Bid);
  
  return {
    callBluff: false,
    quantity: bestBid.quantity,
    value: bestBid.value
  };
}

// Helper function to calculate bid probability using binomial distribution
function calculateBidProbability(needed: number, available: number): number {
  if (needed <= 0) return 1;
  if (needed > available) return 0;
  
  // Simplified binomial probability calculation
  const p = 1/6;
  const n = available;
  const k = needed;
  
  let prob = 0;
  for (let i = k; i <= n; i++) {
    prob += binomial(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
  }
  return prob;
}

// Helper function for binomial coefficient
function binomial(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n + 1 - i) / i;
  }
  return result;
}

// Calculate AI's confidence level in a bid
function calculateConfidenceLevel(dice: number[], quantity: number, value: number): number {
  const valueCount = dice.filter(d => d === value).length;
  const otherValues = dice.filter(d => d !== value).length;
  
  // Base confidence on how many of the bid value AI has
  let confidence = valueCount / dice.length;
  
  // Adjust confidence based on how many other values AI has
  if (otherValues > 0) {
    confidence *= 0.8; // Less confident if AI has other values
  }
  
  // Adjust based on quantity relative to total dice
  const quantityRatio = quantity / dice.length;
  if (quantityRatio > 1.5) {
    confidence *= 0.7; // Less confident with very high quantities
  }
  
  return Math.max(0.1, Math.min(1, confidence));
}

// Analyze potential bids and return an array of viable options
function analyzePotentialBids(
  valueCounts: Record<number, number>,
  currentQuantity: number,
  currentValue: number,
  aiDiceCount: number
): { quantity: number; value: number }[] {
  const bids: { quantity: number; value: number }[] = [];
  
  // Consider increasing quantity
  if (Math.random() < 0.7) {
    bids.push({
      quantity: currentQuantity + 1,
      value: currentValue
    });
  }
  
  // Consider changing value
  for (let v = 1; v <= 6; v++) {
    if (v !== currentValue && valueCounts[v] > 0) {
      bids.push({
        quantity: Math.max(currentQuantity, valueCounts[v] + 1),
        value: v
      });
    }
  }
  
  // Consider wild bid
  if (Math.random() < 0.2) {
    const wildValue = Math.floor(Math.random() * 6) + 1;
    bids.push({
      quantity: Math.floor(currentQuantity * 1.2),
      value: wildValue
    });
  }
  
  return bids;
}

/**
 * Updates game statistics in local storage
 */
export function updateGameStats(winner: 'player' | 'ai'): void {
  if (winner === 'player') {
    const currentWins = parseInt(localStorage.getItem('playerWins') || '0');
    localStorage.setItem('playerWins', (currentWins + 1).toString());
  } else {
    const currentLosses = parseInt(localStorage.getItem('playerLosses') || '0');
    localStorage.setItem('playerLosses', (currentLosses + 1).toString());
  }
  
  const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
  localStorage.setItem('gamesPlayed', (gamesPlayed + 1).toString());
}

/**
 * Determines if a bid is valid compared to the previous bid
 */
export function isValidBid(newBid: Bid, currentBid: Bid | null): boolean {
  if (!currentBid) return true;
  
  return (
    newBid.quantity > currentBid.quantity ||
    (newBid.quantity === currentBid.quantity && newBid.value > currentBid.value)
  );
}