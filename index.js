// index.js
let gold = 0;
let digsRemaining = 40;

const inventory = {
  small: 0,
  medium: 0,
  large: 0
};

const prices = {
  small: 10,
  medium: 25,
  large: 60
};

const museumUnlocked = {
  small: false,
  medium: false,
  large: false
};

let gridFossils = [];

const plotElements = document.querySelectorAll('.plot');
const digsCountEl = document.getElementById('digs-count');
const goldAmountEl = document.getElementById('gold-amount');
const resetBtn = document.getElementById('reset-btn');

const smallCountEl = document.getElementById('small-count');
const mediumCountEl = document.getElementById('medium-count');
const largeCountEl = document.getElementById('large-count');

const sellSmallBtn = document.getElementById('sell-small-btn');
const sellMediumBtn = document.getElementById('sell-medium-btn');
const sellLargeBtn = document.getElementById('sell-large-btn');

const museumSmallEl = document.getElementById('museum-small');
const museumMediumEl = document.getElementById('museum-medium');
const museumLargeEl = document.getElementById('museum-large');

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
  
  // Try placing Large Fossil (3x3)
  placeFossil('large', 3, 3, 'large dino skull.png');

  // Try placing Medium Fossil (2x2)
  placeFossil('medium', 2, 2, 'medium fossil.png');

  // Try placing Small Fossil (1x1)
  placeFossil('small', 1, 1, 'small fossil.png');
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
        if (gridFossils.some(f => f.tiles.some(t => t.r === r && t.c === c))) {
          canPlace = false;
          break;
        }
      }
      if (!canPlace) break;
    }

    if (canPlace) {
      // Must be on layer 1, 2, or 3 (top layer 4 has no fossils)
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

        // Clear background slice styles for this fossil once claimed
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

    // For each tile of the fossil, if this specific tile is dug deep enough, show its corresponding slice of the image
    fossil.tiles.forEach(t => {
      const idx = t.r * 5 + t.c;
      const targetPlot = plotElements[idx];
      const layer = parseInt(targetPlot.getAttribute('data-layer'));

      if (layer <= fossil.targetLayer) {
        // Apply background scaling so the image spans seamlessly across the entire width x height grid block
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

  sellSmallBtn.disabled = inventory.small === 0;
  sellMediumBtn.disabled = inventory.medium === 0;
  sellLargeBtn.disabled = inventory.large === 0;

  if (museumUnlocked.small) museumSmallEl.classList.remove('locked');
  if (museumUnlocked.medium) museumMediumEl.classList.remove('locked');
  if (museumUnlocked.large) museumLargeEl.classList.remove('locked');
}

sellSmallBtn.addEventListener('click', () => sellFossil('small'));
sellMediumBtn.addEventListener('click', () => sellFossil('medium'));
sellLargeBtn.addEventListener('click', () => sellFossil('large'));

function sellFossil(type) {
  if (inventory[type] > 0) {
    inventory[type] -= 1;
    gold += prices[type];
    museumUnlocked[type] = true;
    updateUI();
  }
}

resetBtn.addEventListener('click', initGame);

// Start
initGame();