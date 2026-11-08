// fs/static/fs/js/memory-guest.js
// Copyright © 2025 Dr. Raymond William Kennington Ph.D.

(() => {
  function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();

        // Does this cookie string begin with the name we want?
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }

    return cookieValue;
  }

  // DOM references
  const grid              = document.getElementById('memory-grid');
  const startBtn          = document.getElementById('start-btn');
  const pairCountInput    = document.getElementById('pair-count');
  const autoShapeCB       = document.getElementById('auto-shape');
  const gridShapeSelect   = document.getElementById('grid-shape');
  const nMovesEl          = document.getElementById('moves');
  const nMatchesEl        = document.getElementById('matches');
  const accuracyEl        = document.getElementById('accuracy');
  const scoreEl           = document.getElementById('score');
  const timerEl           = document.getElementById('timer');
  const untimedTurnsRB    = document.getElementById('untimed-turns');
  const loseTurnsRB       = document.getElementById('lose-turn');
  const randomTurnsRB     = document.getElementById('random-turn');
  const moveTimeInput     = document.getElementById('move-time');
  const modeSolitaire     = document.getElementById('mode-solitaire');
  const modeComputer      = document.getElementById('mode-computer');
  const turnContainerEl   = document.getElementById('turn-container');
  const currentTurnEl     = document.getElementById('current-turn');
  const beginnerRB        = document.getElementById('beginner');
  const intermediateRB    = document.getElementById('intermediate');
  const advancedRB        = document.getElementById('advanced');
  const expertRB          = document.getElementById('expert');
  const bestStatsDiv      = document.getElementById('best-stats');
  const highScoreLabel    = document.getElementById('high-score-label');
  const lowMovesLabel     = document.getElementById('low-moves-label');
  const highAccuracyLabel = document.getElementById('high-accuracy-label');
  const fastestTimeLabel  = document.getElementById('fastest-time-label');
  const highScoreEl       = document.getElementById('high-score');
  const lowMovesEl        = document.getElementById('low-moves');
  const highAccuracyEl    = document.getElementById('high-accuracy');
  const fastestTimeEl     = document.getElementById('fastest-time');
  const slider            = document.getElementById("card-size-slider");
  const testImage         = document.getElementById("test-image");
  const imageWidthEl      = document.getElementById("image-width");
  const popup             = document.getElementById("popup-msg");

  const modeRadios = document.querySelectorAll('input[name="mode"]');

  const VISIBLE_TIME = 1000; // milliseconds

  const T1 = 500; // was 350 Delay after 2nd card flipped if no match
  const T2 = 900; // was 900
  const T3 = 800; // was 500 Delay before computer move after player move
  const T4 = 800; // was 800
  const T5 = 900; // was 700 Length of time the computer's choices remain visible
  const T6 = 800; // was 240 Interval between computer picks

  const chanceIntermediateForgets = 0.5;

  // Game state
  let cards            = [];    // card objects from server
  let flipped          = [];    // currently flipped (max 2)
  let lockBoard        = false;
  let nPlayerMoves     = 0;
  let nMatches         = 0;
  let nPlayerMatches   = 0;
  let nPairs           = pairCountInput.value;
  let nUnknownPairs    = nPairs
  let score            = { player:0, computer:0 };
  let playerTurn       = true;
  let playerPosition   = '1';
  let startTime        = null;
  let gameDurationMS   = null;
  let gameAccuracy     = null;
  let timerInterval    = null;
  let beforeStart      = true;
  let nColumns         = 4;
  let computerStrength = 'U';
  let turnTimerId      = null;
  let timingMode       = 'U';
  let autoShapeEnabled = true; // true: auto-adjust number of columns
  let cardWidth        = parseInt(slider.value, 10);
  let prevSliderValue  = parseInt(slider.value, 10); // Initial slider value

  function updateCardWidthProperty() {
    document.documentElement.style.setProperty('--card-width', cardWidth + "px");
  }

  updateCardWidthProperty(); // Initialise --card-width in the CSS

  function stopTurnTimer() {
    if (turnTimerId !== null) {
      clearTimeout(turnTimerId);
      turnTimerId = null;
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const unknownPairsMap = new Map();

  popup.style.display = "none";

  for (const letter of letters) {
    unknownPairsMap.set(letter, true);
  }

  disableComputerStandards();
  disableTimerSettings(false);
  bestStatsDiv.style.display = 'none';

  function resetUnknownPairsMap() {
    for (const key of unknownPairsMap.keys()) {
      unknownPairsMap.set(key, true);
    }
  }

  function countUnknownLetters() {
    let count = 0;

    for (const value of unknownPairsMap.values()) {
      if (value === true)
        ++count;
    }

    return count;
  }

  function isLetterUnknown(letter) {
    return unknownPairsMap.get(letter) === true;
  }

  function setKnown(letter) {
    unknownPairsMap.set(letter, false);
  }

function updateWhoseTurn() {
    if (beforeStart) {
      return;
    }

    if (playerTurn) {
      currentTurnEl.textContent = 'Player';
    } else {
      currentTurnEl.textContent = 'Computer';
    }
  }

  function setInitialTurnInfo(isModeSolitaire) {
    if (isModeSolitaire) {
      playerTurn       = true;
      playerPosition   = '1';
    } else {
      playerTurn       = Math.random() < 0.5;
      playerPosition   = playerTurn ? '1' : '2';
    }

    updateWhoseTurn();
  }

  modeRadios.forEach(radio => {
    radio.addEventListener("change", (event) => {

    if (event.target.checked) { // Execute once only
        setInitialTurnInfo(event.target.value === 'solitaire');
      }
    });
  });

  // ==============================================================
  // = Set the initial possible grid shapes and select the 'best' =
  // ==============================================================
  updateGridShape(nPairs);

  function getBestGridShape(factors) {
    return [2, 2];
  }

  function updateGridShape(numPairs) {
    nPairs = 2; // Set the global value

    const nCards  = 4;
    const factors = [2, 2];

    gridShapeSelect.innerHTML = "";

    const opt = document.createElement("option");
    opt.value       = 2;
    opt.textContent = '2 × 2';

    gridShapeSelect.appendChild(opt);
  }

  // ======================
  // Dynamic grid reshaping
  // ======================

  function getCurrentGridShape() {
    return [2, 2];
  }

  function applyShape(cols) {
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  }

  function showPopup(msg) {
    popup.textContent   = msg;
    popup.style.display = "block";
    popup.style.opacity = "1";
    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.style.display = "none", 800);
    }, 1000);
  }

  // Main auto-fit logic
  function pickBestShapeThatFits(increasingCardWidth) {
    return
  }

  slider.addEventListener("input", () => {
    cardWidth = parseInt(slider.value, 10);
    updateCardWidthProperty();

    increasingCardWidth = cardWidth > prevSliderValue;
    prevSliderValue     = cardWidth

    if (autoShapeEnabled) {
      pickBestShapeThatFits(increasingCardWidth);
    }
    else {
      // the manually-chosen shape will be used
    }
  });

  autoShapeCB.addEventListener('change', (event) => {
    autoShapeEnabled = event.target.checked;

    if (autoShapeEnabled) {
      pickBestShapeThatFits();
    }
  });

  window.addEventListener("resize", () => {
    if (autoShapeEnabled)
      pickBestShapeThatFits();
  });

  // =============================
  // End of dynamic grid reshaping
  // =============================

  function renderGrid() {
    // set CSS column class
    grid.className = 'memory-grid'; // Clears previous classes, including "cols-..."

    nColumns = parseInt(gridShapeSelect.value, 10);

    grid.style.gridTemplateColumns = `repeat(${nColumns || 4}, auto)`;

    grid.classList.add(`cols-${nColumns || 4}`);

    grid.innerHTML = '';

    cards.forEach(card => {
      const el = document.createElement('div');

      el.className      = 'memory-card';
      el.dataset.id     = card.id;
      el.dataset.letter = card.letter;
      el.dataset.frames = card.frames.join(',');

      el.setAttribute('role','button');
      el.setAttribute('aria-pressed','false');

      el.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-back">?</div>
          <div class="card-face card-front">
            <img src="${card.img}" alt="${card.letter}">
          </div>
        </div>`;

      grid.appendChild(el);

      // Have each card click listened to
      el.addEventListener('click', () => onCardClick(card.id));
    });

    applyShape(nColumns);

    // auto-fit immediately after DOM is populated
    if (autoShapeEnabled) {
      requestAnimationFrame(() => pickBestShapeThatFits(false));
    }
  }

  // =================================
  // = Disable/Enable game options   =
  // =================================

  function disableTimerSettings(includeAll) {
    if (includeAll) {
      modeSolitaire .disabled = true;
      modeComputer  .disabled = true;
      untimedTurnsRB.disabled = true;
      randomTurnsRB .disabled = true;
    }

    loseTurnsRB.disabled = true;

    if (modeSolitaire.checked)
      if (loseTurnsRB.checked)
        untimedTurnsRB.checked = true;
  }

  function enableTimerSettings(includeAll) {
    if (includeAll) {
      modeSolitaire .disabled = false;
      modeComputer  .disabled = false;
      untimedTurnsRB.disabled = false;
      randomTurnsRB .disabled = false;
    }

    if (modeComputer.checked)
      loseTurnsRB.disabled = false;

    moveTimeInput.disabled = false;
  }

  function enableComputerStandards() {
    const computerStandardDiv = document.getElementById("computer-standard");

    if (computerStandardDiv) {
      const inputs = computerStandardDiv.querySelectorAll("input");

      inputs.forEach((input) => {
        input.removeAttribute("disabled");
      });
    }
  }

  function disableComputerStandards() {
    const computerStandardDiv = document.getElementById("computer-standard");

    if (computerStandardDiv) {
      const inputs = computerStandardDiv.querySelectorAll("input");

      inputs.forEach((input) => {
        input.setAttribute("disabled", "true");
      });
    }
  }

  modeSolitaire.addEventListener('change', () => {
    if (modeSolitaire.checked) {
      disableComputerStandards();
      disableTimerSettings(false);
    }
  });

  modeComputer.addEventListener('change', () => {
    if (modeComputer.checked) {
      enableComputerStandards();
      enableTimerSettings(false);
    }
  });

  function disableAllGameOptions() {
    const allGameOptionsDiv = document.getElementById("all-game-options");

    if (allGameOptionsDiv) {
      const inputs = allGameOptionsDiv.querySelectorAll("input, select");

      inputs.forEach((input) => {
        input.setAttribute("disabled", "true");
      });
    }

    disableComputerStandards();
    disableTimerSettings(true);

    moveTimeInput.disabled = true;
  }

  function enableAllGameOptions() {
    const allGameOptionsDiv = document.getElementById("all-game-options");

    if (allGameOptionsDiv) {
      const inputs = allGameOptionsDiv.querySelectorAll("input, select");

      inputs.forEach((input) => {
        input.removeAttribute("disabled");
      });
    }

    if (modeComputer.checked)
      enableComputerStandards();

    enableTimerSettings(true);

    moveTimeInput.disabled = false;
  }

  // ==============================================================

  // Start button
  startBtn.addEventListener('click', () => {
    if (startBtn.textContent == 'Start') {
      testImage.style.display = "none";
      disableAllGameOptions();
      bestStatsDiv.style.display = 'none';

      if (!parseInt(pairCountInput.value, 10)) {
        pairCountInput.value = 2;
        updateGridShape(2);
      }

      nPairs      = parseInt(pairCountInput.value,10) || 2;
      beforeStart = false;

      startBtn.textContent = 'Stop';
      startBtn.classList.add("btn-danger");
      startBtn.classList.remove("btn-primary");

      requestMemoryGame();
    } else { // 'Stop'
      // Clear the board
      grid.innerHTML = '';
      grid.className = 'memory-grid';

      clearInterval(timerInterval);
      clearTimeout(turnTimerId);
      currentTurnEl.textContent = '';

      beforeStart = true;
      enableAllGameOptions();
      startBtn.textContent = 'Start';
      startBtn.classList.remove("btn-danger");
      startBtn.classList.add("btn-primary");
      testImage.style.display = "block";
    }
  });

  // fetch game data from server and start
  async function requestMemoryGame() {
    try {
      const response = await fetch(`${MEMORY_NEW_URL}?pairs=${nPairs}`);

      if (!response.ok) {
        enableAllGameOptions();
        throw new Error('Failed to fetch cards');
      }

      const json = await response.json();

      // Expecting json.cards
      const serverCards = json.cards;

      initGame(serverCards);

      if (playerTurn) {
        updateWhoseTurn();
        resetTurnTimer();
      } else { // Computer turn
        stopTurnTimer();
        updateWhoseTurn();

        setTimeout(() => computerMove(), 50);
      }
    } catch (err) {
      enableAllGameOptions();
      console.error('Memory fetch error', err);
      alert('Failed to start game (see console).');
    }
  }

  function initGame(serverCards) {
    // 'cards' is an array of {id, letter, frames, img, face, matched, seen}
    cards = serverCards.map((c, i) => ({
      id      : i,
      letter  : c.letter,
      frames  : Array.isArray(c.frames) ? c.frames : [ (c.frames ?? [''])[0] ],
      img     : `/static/fs/letters/th_${c.letter}${(c.frames && c.frames[0]) || ''}.jpg`,
      faceUp  : false,
      matched : false,
      seen    : false
    }));

    nPlayerMoves   = 0;
    nMatches       = 0;
    nPlayerMatches = 0;
    score          = { player:0, computer:0 };
    playerTurn     = !playerTurn; // Alternate turns for each game

    if (modeSolitaire.checked)
      computerStrength = 'U';
    else {
      if (beginnerRB.checked)
        computerStrength = 'B';
      else if (intermediateRB.checked)
        computerStrength = 'I';
      else if (advancedRB.checked)
        computerStrength = 'A';
      else if (expertRB.checked)
        computerStrength = 'E';
    }

    if (untimedTurnsRB.checked)
      timingMode = 'U';
    else if (loseTurnsRB.checked)
      timingMode = 'L';
    else if (randomTurnsRB.checked)
      timingMode = 'R';

    updateStats();
    renderGrid();
    disableAllGameOptions();

    setInitialTurnInfo(modeSolitaire.checked)

    startClock();
  }

  // flip + animate frames (on face-up)
  function animateFrames(cardEl, cardObj) {
    const frames = cardObj.frames.length ? cardObj.frames : [''];
    const letter = cardObj.letter;
    const imgEl = cardEl.querySelector('img');

    // if only single frame, ensure correct src and return
    if (frames.length <= 1) {
      imgEl.src = `/static/fs/letters/th_${letter}${frames[0] || ''}.jpg`;
      return Promise.resolve();
    }

    // animate frames sequentially and return a promise resolved when done
    return new Promise(resolve => {
      let i = 0;
      const interval = setInterval(() => {
        imgEl.src = `/static/fs/letters/th_${letter}${frames[i]}.jpg`;
        ++i;

        if (i >= frames.length) {
          clearInterval(interval);
          resolve();
        }
      }, 200); // 200ms per frame (tweakable)
    });
  }

  // Card click handler (player side)
  async function onCardClick(cardId) {
    if (lockBoard)
      return;

    const card = cards.find(c => c.id == cardId);
    if (!card || card.matched || card.faceUp)
      return;

    if (!playerTurn && modeComputer.checked) {
      stopTurnTimer();
      return; // if computer's turn
    }

    // flip visually
    const el = grid.querySelector(`.memory-card[data-id="${cardId}"]`);
    el.classList.add('flipped');
    el.setAttribute('aria-pressed','true');
    card.faceUp = true;
    card.seen   = true;
    setKnown(card.letter);

    flipped.push(card);

    if (flipped.length === 2) { // Prevent flipping when one is animating
        lockBoard = true;
    }

    // animate frames (ensure player can see full animation before next action)
    await animateFrames(el, card);

    // reset per-move timer
    if (timingMode !== 'U')
      resetTurnTimer();

    if (flipped.length === 2) {
      ++nPlayerMoves;
      updateStats();

      // small delay so user sees second card
      setTimeout(() => {
        checkMatch();
      }, T1);
    }
  }

  function checkMatch() {
    const [a, b] = flipped;

    if (!a || !b)
      return;

    const match = (a.letter === b.letter);
    if (match) {
      a.matched = true;
      b.matched = true;

      ++nMatches;
      ++nPlayerMatches;
      ++score.player;

      // mark matched visually
      const e1 = grid.querySelector(`.memory-card[data-id="${a.id}"]`);
      const e2 = grid.querySelector(`.memory-card[data-id="${b.id}"]`);

      e1.classList.add('matched');
      e2.classList.add('matched');

      // clear flipped and allow next move (same player gets another go)
      flipped = [];
      updateStats();
      lockBoard = false;

      if (isGameComplete())
        endGame();
      else
        // reset per-move timer
        if (timingMode !== 'U')
          resetTurnTimer();
    } else { // not a match
      // flip back after delay
      setTimeout(() => {
        flipped.forEach(c => {
          c.faceUp = false;
          const el = grid.querySelector(`.memory-card[data-id="${c.id}"]`);
          if (el) {
            el.classList.remove('flipped');
            el.setAttribute('aria-pressed','false');
          }
        });

        flipped   = [];
        lockBoard = false;

        // pass turn if playing vs computer
        if (modeComputer.checked) {
          playerTurn = false;
          stopTurnTimer();
          updateWhoseTurn();
          setTimeout(() => computerMove(), T3);
        }
      }, T2);
    }
  }

  // Turn timeout handling
  function resetTurnTimer() {
    stopTurnTimer();

    if (!playerTurn) // computer does NOT get a timer
      return;

    if (timingMode === 'U') // only if timers are enabled
      return;

    const ms = Math.max(1, parseInt(moveTimeInput.value, 10) || 10) * 1000;

    turnTimerId = setTimeout(() => {
      handleSlowMove();
    }, ms);
  }

  function handleSlowMove() {
    stopTurnTimer(); // prevent re-triggering immediately

    // if lose turn option, simply pass turn
    if (loseTurnsRB.checked && modeComputer.checked) {
      // brief visual lock
      lockBoard = true;

      playerTurn = false;
      updateWhoseTurn();

      setTimeout(() => { lockBoard = false; computerMove(); }, 800);
    } else if (randomTurnsRB.checked) { // reveal 2 random unmatched cards for the player
      playerTurn = true;
      updateWhoseTurn();

      const hidden = cards.filter(c => !c.faceUp && !c.matched);

      if (hidden.length >= 2) {
        lockBoard = true;

        // pick 2 random distinct
        const shuffled = shuffle(hidden);
        const [c1, c2] = [shuffled[0], shuffled[1]];

        // flip, animate, then flip back (unless they match)
        flipForAuto(c1, c2);
      }
    }
  }

  async function flipForAuto(c1, c2) {
    // flip visually
    const el1 = grid.querySelector(`.memory-card[data-id="${c1.id}"]`);
    const el2 = grid.querySelector(`.memory-card[data-id="${c2.id}"]`);

    if (!el1 || !el2) {
      lockBoard = false;
      return;
    }

    el1.classList.add('flipped');
    c1.faceUp = true;
    c1.seen   = true;
    setKnown(c1.letter);

    await animateFrames(el1, c1);
    await delay(T6);

    el2.classList.add('flipped');
    c2.faceUp = true;
    c2.seen   = true;
    setKnown(c2.letter);

    await animateFrames(el2, c2);
    await delay(T6);

    if (c1.letter === c2.letter) {
      // Have a match
      c1.matched = c2.matched = true;

      el1.classList.add('matched');
      el2.classList.add('matched');

      // NB: Auto-flipping and luckily making a pair does not contribute to the Player's nPlayerMatches score
      ++nMatches;
      ++score.player; // auto-flip counts towards player
      updateStats();

      flipped = [];

      // Pause before repeating
      await delay(VISIBLE_TIME);

      if (isGameComplete())
        endGame();

      if (modeComputer.checked) {
        stopTurnTimer();
        setTimeout(() => computerMove(), T3);
      } else {
        lockBoard = false;
        resetTurnTimer();
      }
    } else { // Not a match — flip back
      await delay(T5);

      el1.classList.remove('flipped');
      el2.classList.remove('flipped');

      c1.faceUp = false;
      c2.faceUp = false;

      if (modeComputer.checked) {
        // Computer's turn now
        playerTurn = false;
      }

      updateStats();
      updateWhoseTurn();

      if (modeComputer.checked) {
        stopTurnTimer();
        setTimeout(() => computerMove(), T3);
      } else {
        lockBoard = false;
        resetTurnTimer();
      }
    }
  }

  function getBeginnerMove() {
    // pick two cards at random from the unmatched

    const hidden = cards.filter(c => !c.faceUp && !c.matched);

    const shuffled = shuffle(hidden);
    const [c1, c2] = [shuffled[0], shuffled[1]];

    return [c1, c2];
  }

  function getIntermediateMove() {
    // Choose a pair from the 'seen', else pick random
    // The above rule makes the Intermediate player too strong
    // Therefore provide a chance that the computer doesn't remember

    if (Math.random() < chanceIntermediateForgets)
      return getBeginnerMove();

    const seen = cards.filter(c => !c.faceUp && !c.matched && c.seen);

    if (seen.length === 0)
      return getBeginnerMove();

    // Display cards that have been seen
    //console.log("Seen letters:", seen.map(c => `${c.id}:${c.letter}`).join(", "));

    // Find all seen cards that match up

    pairs = [];

    for (let i = 0; i < seen.length - 1; ++i) {
      for (let j = i + 1; j < seen.length; ++j) {
        if (seen[i].letter === seen[j].letter) {
          pairs.push([seen[i], seen[j]]);
        }
      }
    }

    // Print pairs
    if (pairs.length === 0) {
      //console.log("Pairs: <none>");
    } else {
      //console.log("Pairs:", pairs.map(p => `[${p[0].id}, ${p[1].id}]`).join(", "));
    }

    if (pairs.length > 0) {
      //console.log("'pairs' is not empty");
    }

    if (pairs.length === 0) {
      return getBeginnerMove();
    }

    // Choose a random pair that has been seen already
    const shuffled = shuffle(pairs);
    const [c1, c2] = shuffled[0];

    return [c1, c2];
  }

  function findSecondCard(c1, cards) {
    // Called with >= 1 seen and >= 1 unseen cards and no match in the 'seen' cards

    // seen = face-down, unmatched cards, seen
    const seen = cards.filter(c => !c.faceUp && !c.matched && c.seen);

    // 1. Try to find c1's match in seen cards
    const match = seen.find(c => c.letter === c1.letter && c.id !== c1.id);

    if (match) {
      // Found matching seen card → return both cards
      return { found: true, c2: match };
    }

    // 2. No match in seen => choose a random different unseen card
    const unseen = cards.filter(c => !c.faceUp && !c.matched && !c.seen && c.id !== c1.id);

    const c2 = unseen[Math.floor(Math.random() * unseen.length)];

    return { found: false, c2 };
  }

  function getAdvancedMove() {
    // Choose a pair from the 'seen',
    // else pick an unseen and check if can match a 'seen' card,
    // else draw the 2nd card from unmatched cards at random

    const seen = cards.filter(c => !c.faceUp && !c.matched && c.seen);

    if (seen.length === 0)
      return getBeginnerMove();

    // Display cards that have been seen
    //console.log("Seen letters:", seen.map(c => `${c.id}:${c.letter}`).join(", "));

    // Find all seen cards that match up

    pairs = [];

    for (let i = 0; i < seen.length - 1; ++i) {
      for (let j = i + 1; j < seen.length; ++j) {
        if (seen[i].letter === seen[j].letter) {
          pairs.push([seen[i], seen[j]]);
        }
      }
    }

    // Print pairs
    if (pairs.length === 0) {
      //console.log("Pairs: <none>");
    } else {
      //console.log("Pairs:", pairs.map(p => `[${p[0].id}, ${p[1].id}]`).join(", "));
    }

    if (pairs.length > 0) {
      const shuffled = shuffle(pairs);
      const [c1, c2] = shuffled[0];

      return [c1, c2];
    }

    // No match amongst the 'seen' cards

    // Choose a random card from the unseen cards
    const unseen = cards.filter(c => !c.faceUp && !c.matched && !c.seen);

    if (unseen.length === 0)
      return getBeginnerMove();

    const c1 = unseen[Math.floor(Math.random() * unseen.length)];

    const {found, c2} = findSecondCard(c1, cards);

    return [c1, c2];
  }

  function getExpertMove() {
    // Choose a pair from the 'seen',
    // else choose according to Erik Alfthan eral02@kth.se May 21, 2007"
    // "Optimal strategy in the children's game Memory"

    const seen   = cards.filter(c => !c.faceUp && !c.matched && c.seen);
    const unseen = cards.filter(c => !c.faceUp && !c.matched && !c.seen);

    if (seen.length > 0) {
      // Find all seen cards that match up

      pairs = [];

      for (let i = 0; i < seen.length - 1; ++i) {
        for (let j = i + 1; j < seen.length; ++j) {
          if (seen[i].letter === seen[j].letter) {
            pairs.push([seen[i], seen[j]]);
          }
        }
      }

      if (pairs.length > 0) {
        const [c1, c2] = shuffle(pairs)[0];

        return [c1, c2];
      }
    }

    // No match amongst the 'seen' cards

    nUnknownPairs = countUnknownLetters();

    if (nUnknownPairs === 0) {
      // Choose an 'unseen' card at random; it will pair up with a 'seen' card
      // To get here, there must be 'unseen' and 'seen' cards

      // Pick an unseen card randomly
      const unseen = cards.filter(c => !c.faceUp && !c.matched && !c.seen);

      const c1 = unseen[Math.floor(Math.random() * unseen.length)];

      // Find c1's match in the 'seen' cards

      const match = seen.find(c => c.letter === c1.letter && c.id !== c1.id);

      return [c1, match];

    } else if (nUnknownPairs === nPairs) {
      // Start of the game
      getBeginnerMove();
    } else if (nUnknownPairs % 2 === 0) { // even
      risky = false;

      if (nUnknownPairs === 6)
        if (nPairs <= 8)
          risky = true;
    } else { // odd
      risky = true;

      if (nUnknownPairs === 5)
        if (nPairs <= 9)
          risky = false;
      else if (nUnknownPairs === 7)
        if (nPairs <= 9 || (nPairs >= 12 && nPairs <= 15))
          risky = false;
    }

    // Pick an unseen card randomly
    const c1 = unseen[Math.floor(Math.random() * unseen.length)];

    // Match if possible

    const match = seen.find(c => c.letter === c1.letter && c.id !== c1.id);

    if (match)
      return [c1, match];

    // No match found

    if (risky) {
      // Pick another unseen card

      const unseenNotSelf = unseen.filter(c => c.id !== c1.id);
      const c2            = unseenNotSelf[Math.floor(Math.random() * unseenNotSelf.length)];

      return [c1, c2];
    } else { // not 'risky'; i.e. 'safe'
      // Pick any seen card

      const seen = cards.filter(c => !c.faceUp && !c.matched && !c.seen);
      const c2   = seen[Math.floor(Math.random() * seen.length)];

      return [c1, c2];
    }
  }

  let computerBusy = false;

  async function computerMove() {
    lockboard = true
    stopTurnTimer();
    playerTurn = false;
    updateWhoseTurn();

    // Prevent overlapping turns
    if (computerBusy) {
      return;
    }

    computerBusy = true;

    try {
      while (true) {
        if (isGameComplete()) {
          endGame();
          break;
        }

        // pick two unmatched hidden cards
        const hidden = cards.filter(c => !c.faceUp && !c.matched);
        if (hidden.length < 2)
          break;

        if (beginnerRB.checked)
          [c1, c2] = getBeginnerMove();
        else if (intermediateRB.checked)
          [c1, c2] = getIntermediateMove();
        else if (advancedRB.checked)
          [c1, c2] = getAdvancedMove();
        else if (expertRB.checked)
          [c1, c2] = getExpertMove();
        else
          [c1, c2] = getBeginnerMove();

        const el1 = grid.querySelector(`.memory-card[data-id="${c1.id}"]`);
        const el2 = grid.querySelector(`.memory-card[data-id="${c2.id}"]`);

        if (!el1 || !el2)
          break;

        // Flip first card
        el1.classList.add('flipped');
        c1.faceUp = true;
        c1.seen   = true;
        setKnown(c1.letter);

        await animateFrames(el1, c1);
        await delay(T6);

        // Flip second card
        el2.classList.add('flipped');
        c2.faceUp = true;
        c2.seen   = true;
        setKnown(c2.letter);

        await animateFrames(el2, c2);
        await delay(T6);

        // Evaluate
        if (c1.letter === c2.letter) {
          // Have a match
          c1.matched = c2.matched = true;

          el1.classList.add('matched');
          el2.classList.add('matched');

          ++nMatches;
          ++score.computer;
          updateStats();

          flipped = [];

          // Pause before repeating
          await delay(VISIBLE_TIME);

          // Loop continues (computer goes again)
          // continue; Continues looping; no need to be explicit about it

        } else { // Not a match — flip back
          await delay(T5);

          el1.classList.remove('flipped');
          el2.classList.remove('flipped');

          c1.faceUp = false;
          c2.faceUp = false;

          // Computer stops; player's turn begins
          playerTurn = true;
          updateStats();
          updateWhoseTurn();
          break;
        }
      }
    } finally {
      computerBusy = false; // Always unlock
      lockBoard    = false; // Always unlock

      // reset per-move timer
      if (timingMode !== 'U')
        resetTurnTimer();
    }
  }

  // Small delay to give the user time to see the images
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function updateStats() {
    nMatchesEl.textContent = `${nPlayerMatches}`;

    if (modeSolitaire.checked)
      scoreEl.textContent = `${score.player}`;
    else
      scoreEl.textContent = `P ${score.player} / C ${score.computer}`;

    nMovesEl  .textContent = `${nPlayerMoves}`;
    gameAccuracy           = nPlayerMoves === 0 ? 0 : Math.round((nPlayerMatches / nPlayerMoves) * 100);
    accuracyEl.textContent = `${gameAccuracy}%`;
  }

  function isGameComplete() {
    return nMatches >= nPairs;
  }

  function endGame() {
    clearInterval(timerInterval);
    clearTimeout(turnTimerId);

    currentTurnEl.textContent = '';
    beforeStart               = true;
    testImage.style.display   = "block";

    if (modeComputer.checked) {
      const scores = `Game over!\nPlayer ${score.player} — Computer ${score.computer}`;

      if (score.player > score.computer) {
        const winner = 'Player';
        setTimeout(() => alert(scores + `\nWinner: ${winner}`), 200);
      } else if (score.player < score.computer) {
        const winner = 'Computer';
        setTimeout(() => alert(scores + `\nWinner: ${winner}`), 200);
      }
      else {
        setTimeout(() => alert(scores + "\nIt's a draw"), 200);
      }
    }

    submitMemoryResult()
      .then(data => {
        updateHighScoreDisplay(data);
      });

    enableAllGameOptions();

    startBtn.textContent = 'Start';
    startBtn.classList.remove("btn-danger");
    startBtn.classList.add("btn-primary");

    resetUnknownPairsMap();
  }

  // clock
  function startClock() {
    clearInterval(timerInterval);
    startTime = Date.now();

    timerInterval = setInterval(() => {
      const t = Date.now() - startTime;
      const mins = String(Math.floor(t / 60000)).padStart(2,'0');
      const secs = String(Math.floor((t % 60000) / 1000)).padStart(2,'0');

      timerEl.textContent = `${mins}:${secs}`;
      gameDurationMS      = t;
    }, 300);
  }

  // Process game options

  document.addEventListener('DOMContentLoaded', () => {
    // Select all number inputs to be clamped
    const inputs = document.querySelectorAll('#pair-count', '#move-time');
    if (!inputs.length)
      return;

    function clamp(input) {
      const min = parseInt(input.min, 10);
      const max = parseInt(input.max, 10);
      const raw = input.value.trim();

      // Allow blank temporarily
      if (raw === '')
        return;

      // Check numeric
      const num = Number(raw);
      if (!Number.isFinite(num)) {
        input.value = min;
        flash(input);

        return;
      }

      // Enforce integer (reject decimals)
      if (!Number.isInteger(num)) {
        input.value = Math.round(num);
        flash(input);
        return;
      }

      // Clamp range
      if (num < min) {
        input.value = min;
        flash(input);
      } else if (num > max) {
        input.value = max;
        flash(input);
      }
    }

    // Flash animation
    function flash(el) {
      el.classList.add('clamped');
      setTimeout(() => el.classList.remove('clamped'), 300);
    }

    // Attach listeners for each relevant input
    inputs.forEach(input => {
      // Do *not* clamp using 'input', which responds to user edits
      // Reason: Need to allow having '1' in the input prior to entering
      // any 2-digit number starting with 1

      input.addEventListener('change', () => {
        clamp(input); // after change

        if (input.id === 'pair-count') {
          updateGridShape(parseInt(input.value, 10));
        }
      })

      input.addEventListener('blur',   () => {
        clamp(input); // on leaving field

        if (input.id === 'pair-count') {
          updateGridShape(parseInt(input.value, 10));
        }
      })
    });
  });

  function makePopover(id, htmlText) {
    new bootstrap.Popover(document.getElementById(id), {
      content: htmlText,
      html: true
    });
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; --i) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  document.addEventListener("DOMContentLoaded", function () {

      const memoryInfo = `
          1. Helps you learn FS.<br>
          2. Good for your brain: boosts memory and cognitive skills.<br>
          3. Constantly challenging.<br>
          4. Fun.<br>
          5. Reduces stress levels.<br>
          6. Improves patience and concentration.<br>
          7. Helps foster problem-solving abilities.<br>
          8. Rejuvenates the mind and promotes sharper thinking.<br>
          9. Requires single-task focus and attention to detail.<br>
          10. Enhances strategic thinking.<br>
          11. Can share scores and compete for personal bests.
      `;

      const memoryBestScoresInfo = `
          At the end of the game, your best scores and times will appear above the grid.<br><br>
          These depend on what the specifications of the game are.
      `;

      makePopover("memory-info"            , memoryInfo);
      makePopover("memory-best-scores-info", memoryBestScoresInfo);
  });

  function triggerHighlight(el) {
    el.classList.remove("highlight");
    void el.offsetWidth;   // forces reflow
    el.classList.add("highlight");

    // Remove after animation ends
    setTimeout(() => {
      el.classList.remove("highlight");
    }, 3000); // match the animation duration
  }

  function updateHighScoreDisplay(data) {
    bestStatsDiv.style.display = 'block';

    bestStatsDiv.querySelectorAll('[style*="display: none"]').forEach(el => {
        el.style.display = '';
    });

    if (modeSolitaire.checked) {
      highScoreLabel.style.display = 'none';
      highScoreEl   .style.display = 'none';

      if (data.created) { // A new record
        lowMovesLabel    .textContent = "First moves: ";
        highAccuracyLabel.textContent = "First accuracy: ";
        fastestTimeLabel .textContent = "First time: ";
      }
      else { // Updating an existing record
        if (data.improved_moves) {
          lowMovesLabel.textContent = "New low moves: ";
        }
        else {
          lowMovesLabel.textContent = "Low moves still: ";
        }

        if (data.improved_time) {
          fastestTimeLabel.textContent = "New minimum time: ";
        }
        else {
          fastestTimeLabel.textContent = "Minimum time still: ";
        }

        if (data.improved_accuracy) {
          highAccuracyLabel.textContent = "New high accuracy: ";
        } else {
          highAccuracyLabel.textContent = "High accuracy still: ";
        }
      }

      lowMovesEl    .textContent = data.current_min_moves + " | ";
      highAccuracyEl.textContent = `${data.current_max_accuracy}% | `
      fastestTimeEl .textContent = data.current_min_time !== null
                                    ? `${(data.current_min_time / 1000).toFixed(2)}s`
                                    : "-"
    } else { // modeComputer.checked
      lowMovesLabel   .style.display = 'none';
      lowMovesEl      .style.display = 'none';
      fastestTimeLabel.style.display = 'none';
      fastestTimeEl   .style.display = 'none';

      if (data.created) { // A new record
        highScoreLabel   .textContent = "First score: ";
        lowMovesLabel    .textContent = "First moves: ";
        highAccuracyLabel.textContent = "First accuracy: ";
        fastestTimeLabel .textContent = "First time: ";
      }
      else { // Updating an existing record
        if (data.improved_score) {
          highScoreLabel.textContent = "New high score: ";
        }
        else {
          highScoreLabel.textContent = "High score still: ";
        }

        if (data.improved_accuracy) {
          highAccuracyLabel.textContent = "New high accuracy: ";
        } else {
          highAccuracyLabel.textContent = "High accuracy still: ";
        }
      }

      highScoreEl   .textContent = data.current_max_score + " | ";
      highAccuracyEl.textContent = `${data.current_max_accuracy}%`
    }

    // Visual feedback
    if (!data.created) {
      if (data.improved_score) {
        triggerHighlight(highScoreEl);
        triggerHighlight(highScoreLabel);
      }

      if (data.improved_moves) {
        triggerHighlight(lowMovesEl);
        triggerHighlight(lowMovesLabel);
      }

      if (data.improved_accuracy) {
        triggerHighlight(highAccuracyEl);
        triggerHighlight(highAccuracyLabel);
      }

      if (data.improved_time) {
        triggerHighlight(fastestTimeEl);
        triggerHighlight(fastestTimeLabel);
      }
    }
  }

  async function submitMemoryResult() {
    if (gameDurationMS == null) {
      console.error("Tried to save result before duration computed!");
      return;
    }

    const data = new URLSearchParams({
      nPairs            : nPairs,
      nColumns          : nColumns,
      game_mode         : modeSolitaire.checked ? 'S' : 'C', // 'S' or 'C'
      computer_strength : computerStrength,
      timing_mode       : timingMode,                        // 'U', 'L', 'R'
      time_per_move     : moveTimeInput.value,
      position          : playerPosition,

      score             : score.player,
      moves             : nPlayerMoves,
      accuracy          : gameAccuracy.toString(),
      gameDurationMS    : gameDurationMS.toString()
    });

    const response = await fetch("/fs/save_memory_result/", {
      method: "POST",
      headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data.toString()
    });

    const result = await response.json();

    return result;
  }

  slider.addEventListener("input", () => {
    cardWidth = Math.max(48, parseInt(slider.value, 10));
    updateCardWidthProperty();

    imageWidthEl.textContent = cardWidth;
    testImage.style.width = `${cardWidth}px`;
  });
})();
