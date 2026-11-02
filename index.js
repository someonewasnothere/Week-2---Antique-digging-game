let gold = 0;
let digsRemaining = 40;

const inventory = {
  small: 0,
  medium: 0,
  large: 0,
  diamond: 0
};

const prices = {
  small: 10,
  medium: 25,
  large: 60,
  diamond: 200
};

const museumTotalFound = {
  small: 0,
  medium: 0,
  large: 0,
  diamond: 0,
  coin: 0
};

let gridFossils = [];

const plotElements = document.querySelectorAll('.plot');
const digsCountEl = document.getElementById('digs-count');
const goldAmountEl = document.getElementById('gold-amount');
const resetBtn = document.getElementById('reset-btn');

const smallCountEl = document.getElementById('small-count');
const mediumCountEl = document.getElementById('medium-count');
const largeCountEl = document.getElementById('large-count');
const diamondCountEl = document.getElementById('diamond-count');

const sellSmallBtn = document.getElementById('sell-small-btn');
const sellMediumBtn = document.getElementById('sell-medium-btn');
const sellLargeBtn = document.getElementById('sell-large-btn');
const sellDiamondBtn = document.getElementById('sell-diamond-btn');
const buyCoinBtn = document.getElementById('buy-coin-btn');

const museumSmallEl = document.getElementById('museum-small');
const museumMediumEl = document.getElementById('museum-medium');
const museumLargeEl = document.getElementById('museum-large');
const museumDiamondEl = document.getElementById('museum-diamond');
const museumCoinEl = document.getElementById('museum-coin');

const foundSmallEl = document.getElementById('found-small');
const foundMediumEl = document.getElementById('found-medium');
const foundLargeEl = document.getElementById('found-large');
const foundDiamondEl = document.getElementById('found-diamond');
const foundCoinEl = document.getElementById('found-coin');

function initGame() {
  digsRemaining = 40;
  digsCountEl.textContent = digsRemaining;

  plotElements.forEach(plot => {
    plot.setAttribute('data-layer', '4');
    plot.className = 'plot layer-4 diggable';
    plot.style.backgroundImage = '';
    plot.style.backgroundSize = '';
    plot.style.backgroundPosition = '';
  });

  generateFossils();
  updateUI();
}

function generateFossils() {
  gridFossils = [];
  
  const potentialFossils = [
    { type: 'large', width: 3, height: 3, imageSrc: 'large dino skull.png', chance: 0.5 },
    { type: 'medium', width: 2, height: 2, imageSrc: 'medium fossil.png', chance: 0.5 },
    { type: 'small', width: 1, height: 1, imageSrc: 'small fossil.png', chance: 0.5 },
    { type: 'diamond', width: 1, height: 1, imageSrc: 'diamond.png', chance: 0.1 }
  ];

  potentialFossils.forEach(f => {
    if (Math.random() < f.chance) {
      placeFossil(f.type, f.width, f.height, f.imageSrc);
    }
  });
}

function placeFossil(type, width, height, imageSrc) {
  let placed = false;
  let attempts = 0;

  while (!placed && attempts < 100) {
    attempts++;
    const startRow = Math.floor(Math.random() * (5 - height + 1));
    const startCol = Math.floor(Math.random() * (5 - width + 1));

    let canPlace = true;
    for (let r = startRow; r < startRow + height; r++) {
      for (let c = startCol; c < startCol + width; c++) {
        if (gridFossils.some(item => item.tiles.some(t => t.r === r && t.c === c))) {
          canPlace = false;
          break;
        }
      }
      if (!canPlace) break;
    }

    if (canPlace) {
      const fossilLayer = Math.floor(Math.random() * 3) + 1;
      const tiles = [];

      for (let r = startRow; r < startRow + height; r++) {
        for (let c = startCol; c < startCol + width; c++) {
          tiles.push({ r, c, localR: r - startRow, localC: c - startCol });
        }
      }

      gridFossils.push({
        id: type + '_' + Date.now(),
        type,
        width,
        height,
        imageSrc,
        targetLayer: fossilLayer,
        startRow,
        startCol,
        tiles,
        claimed: false
      });

      placed = true;
    }
  }
}

plotElements.forEach(plot => {
  plot.addEventListener('click', () => {
    const index = parseInt(plot.getAttribute('data-index'));
    const row = Math.floor(index / 5);
    const col = index % 5;
    let currentLayer = parseInt(plot.getAttribute('data-layer'));

    // Option 1: Dig layer
    if (currentLayer > 0 && digsRemaining > 0) {
      currentLayer -= 1;
      digsRemaining -= 1;

      plot.setAttribute('data-layer', currentLayer);
      plot.className = 'plot';

      if (currentLayer > 0) {
        plot.classList.add(`layer-${currentLayer}`, 'diggable');
      } else {
        plot.classList.add('fully-dug');
      }

      digsCountEl.textContent = digsRemaining;
      checkFossilExposures();
      return;
    }

    // Option 2: Claim exposed fossil
    if (currentLayer === 0) {
      const matchingFossil = gridFossils.find(f => 
        !f.claimed && f.tiles.some(t => t.r === row && t.c === col)
      );

      if (matchingFossil && isFossilFullyUncovered(matchingFossil)) {
        matchingFossil.claimed = true;
        inventory[matchingFossil.type] += 1;

        matchingFossil.tiles.forEach(t => {
          const idx = t.r * 5 + t.c;
          plotElements[idx].style.backgroundImage = '';
          plotElements[idx].style.backgroundSize = '';
          plotElements[idx].style.backgroundPosition = '';
        });

        updateUI();
      }
    }
  });
});

function isFossilFullyUncovered(fossil) {
  return fossil.tiles.every(t => {
    const idx = t.r * 5 + t.c;
    const layer = parseInt(plotElements[idx].getAttribute('data-layer'));
    return layer <= fossil.targetLayer;
  });
}

function checkFossilExposures() {
  gridFossils.forEach(fossil => {
    if (fossil.claimed) return;

    fossil.tiles.forEach(t => {
      const idx = t.r * 5 + t.c;
      const targetPlot = plotElements[idx];
      const layer = parseInt(targetPlot.getAttribute('data-layer'));

      if (layer <= fossil.targetLayer) {
        targetPlot.style.backgroundImage = `url('${fossil.imageSrc}')`;
        targetPlot.style.backgroundSize = `${fossil.width * 100}% ${fossil.height * 100}%`;
        targetPlot.style.backgroundPosition = `${(t.localC / (fossil.width - 1 || 1)) * 100}% ${(t.localR / (fossil.height - 1 || 1)) * 100}%`;
        targetPlot.style.backgroundRepeat = 'no-repeat';
      }
    });
  });
}

function updateUI() {
  goldAmountEl.textContent = gold;
  smallCountEl.textContent = inventory.small;
  mediumCountEl.textContent = inventory.medium;
  largeCountEl.textContent = inventory.large;
  diamondCountEl.textContent = inventory.diamond;

  sellSmallBtn.disabled = inventory.small === 0;
  sellMediumBtn.disabled = inventory.medium === 0;
  sellLargeBtn.disabled = inventory.large === 0;
  sellDiamondBtn.disabled = inventory.diamond === 0;
  buyCoinBtn.disabled = gold < 100;

  // Counters in Museum
  foundSmallEl.textContent = museumTotalFound.small;
  foundMediumEl.textContent = museumTotalFound.medium;
  foundLargeEl.textContent = museumTotalFound.large;
  foundDiamondEl.textContent = museumTotalFound.diamond;
  foundCoinEl.textContent = museumTotalFound.coin;

  if (museumTotalFound.small > 0) museumSmallEl.classList.remove('locked');
  if (museumTotalFound.medium > 0) museumMediumEl.classList.remove('locked');
  if (museumTotalFound.large > 0) museumLargeEl.classList.remove('locked');
  if (museumTotalFound.diamond > 0) museumDiamondEl.classList.remove('locked');
  if (museumTotalFound.coin > 0) museumCoinEl.classList.remove('locked');
}

sellSmallBtn.addEventListener('click', () => sellFossil('small'));
sellMediumBtn.addEventListener('click', () => sellFossil('medium'));
sellLargeBtn.addEventListener('click', () => sellFossil('large'));
sellDiamondBtn.addEventListener('click', () => sellFossil('diamond'));

buyCoinBtn.addEventListener('click', () => {
  if (gold >= 100) {
    gold -= 100;
    museumTotalFound.coin += 1;
    updateUI();
  }
});

function sellFossil(type) {
  if (inventory[type] > 0) {
    inventory[type] -= 1;
    gold += prices[type];
    museumTotalFound[type] += 1;
    updateUI();
  }
}

resetBtn.addEventListener('click', initGame);

// Start
initGame();