// fs/static/fs/js/blockwords.js
// Copyright © 2025 Dr. Raymond William Kennington Ph.D.

(() => {
  // DOM
  const RANDOM_URL   = "/fs/blockword/random/";

  const newBtn       = document.getElementById("new-btn");
  const addBtn       = document.getElementById("add-btn");
  const cancelBtn    = document.getElementById("cancel-btn");
  const backBtn      = document.getElementById("back-btn");
  const hintBtn      = document.getElementById("hint-btn");

  const grid         = document.getElementById("grid-3x3");
  const currentSel   = document.getElementById("current-selection");
  const list3        = document.getElementById("list-3");
  const list4        = document.getElementById("list-4");
  const list5        = document.getElementById("list-5");
  const count3       = document.getElementById("count-3");
  const count4       = document.getElementById("count-4");
  const count5       = document.getElementById("count-5");
  const grandTotalEl = document.getElementById("grand-total");
  const intTeg       = 0x83;
  const goalPerCol   = 10;

  const letterFrames = {
    H: ["0", "1", "2", "3", "4"],
    J: ["0", "1", "2"]
  };

  // Animation timing (same as memory.js)
  const frameDuration  = 250;       // ms
  const gapDuration    = 3000;      // ms pause between loops
  const tileAnimations = new Map();
  const miniAnimations = new Map();
  const imageCache = new Map();     // key: "A", "H0", "J2", etc → value: HTMLImageElement

// Game state
  let serverData = null;                          // latest object from server
  let tiles      = [];                            // objects {id,index,letter,el,used}
  let selection  = [];                            // selected tile objects in order
  let found      = { "3": [], "4": [], "5": [] }; // words found (strings)

  function clearBoardUI() {
    grid.innerHTML       = "";
    currentSel.innerHTML = "";

    tiles     = [];
    selection = [];
  }

  function format_count(count) {
    if (count < 10)
      return "  " + count.toString() + "/" + goalPerCol.toString();
    else if (count < 100)
      return " "  + count.toString() + "/" + goalPerCol.toString();
    else
      return        count.toString() + "/" + goalPerCol.toString();
  }

  function updateCounts() {
    count3.textContent = format_count(found["3"].length) + " [" + String(serverData.subwords["3"].length).padStart(3, ' ') + "]";
    count4.textContent = format_count(found["4"].length) + " [" + String(serverData.subwords["4"].length).padStart(3, ' ') + "]";
    count5.textContent = format_count(found["5"].length) + " [" + String(serverData.subwords["5"].length).padStart(3, ' ') + "]";

    const total = found["3"].length + found["4"].length + found["5"].length;

    grandTotalEl.textContent = `${total} / ${3 * goalPerCol}`;

    try {
      document.getElementById("count-3-top").textContent = count3.textContent;
      document.getElementById("count-4-top").textContent = count4.textContent;
      document.getElementById("count-5-top").textContent = count5.textContent;
    }
    catch (err) {
      // Ignore this error, as it occurs when starting up and the elements don't exist yet
    }
  }

function makeTile(i, letter) {
  const el         = document.createElement("div");
  el.className     = "tile";
  el.dataset.index = i;

  const upper      = letter.toUpperCase();
  const firstFrame = letterFrames[upper] ? letterFrames[upper][0] : "";

  const img = getCachedImage(upper, firstFrame);

  if (letterFrames[upper]) {
      startTileAnimation(img, upper, letterFrames[upper]);
  }

  el.appendChild(img);
  grid.appendChild(el);

  const tileObj = {
    id       : i,
    index    : i,
    letter   : letter.toLowerCase(),
    el       : el,
    used     : false,
    wordIndex: null
  };

  el.addEventListener("click", () => onTileClick(tileObj));
  tiles.push(tileObj);
}

function startTileAnimation(imgElement, letter, frames) {
  let index = 0;

  const showFrame = () => {
    const suffix   = frames[index];
    imgElement.src = `/static/fs/letters/th_${letter}${suffix}.jpg`;
    index          = (index + 1) % frames.length;
  };

  const loop = () => {
    const interval = setInterval(() => {
      showFrame();
      if (index === 0) {
        clearInterval(interval);
        const timeout = setTimeout(loop, gapDuration);
        tileAnimations.set(imgElement, { interval: null, timeout });
      }
    }, frameDuration);

    tileAnimations.set(imgElement, { interval });
  };

  // Show first frame instantly, then loop multiple frames
  showFrame();
  loop();
}

function startMiniAnimation(imgElement, letter, frames) {
  let index = 0;

  const showFrame = () => {
    const suffix = frames[index];
    imgElement.src = `/static/fs/letters/th_${letter}${suffix}.jpg`;
    index = (index + 1) % frames.length;
  };

  const loop = () => {
    const interval = setInterval(() => {
      showFrame();

      if (index === 0) {
        clearInterval(interval);
        const timeout = setTimeout(loop, gapDuration);
        miniAnimations.set(imgElement, { interval: null, timeout });
      }
    }, frameDuration);

    miniAnimations.set(imgElement, { interval });
  };

  // Show first frame instantly then loop multiple frames
  showFrame();
  loop();
}

function renderFoundWord(word, len) {
  const container =
    (len === 3) ? list3 :
    (len === 4) ? list4 :
                  list5;

  const row        = document.createElement("div");
  row.className    = "found-word-row";
  row.dataset.word = word;

  word.split("").forEach(ch => {
    const upper      = ch.toUpperCase();
    const frames     = letterFrames[upper];
    const firstFrame = frames ? frames[0] : "";

    const img     = getCachedImage(upper, firstFrame);
    img.className = "small-tile";

    row.appendChild(img);

    if (frames) {
      startMiniAnimation(img, upper, frames);
    }
  });

  // insert alphabetically
  const rows   = Array.from(container.children);
  let insertAt = rows.findIndex(r => r.dataset.word > word);

  if (insertAt === -1)
    container.appendChild(row);
  else
    container.insertBefore(row, rows[insertAt]);
}

function onTileClick(tile) {

  // CASE 1 — Tile already used: remove THIS tile from the word
  if (tile.used) {
    const removeAt = tile.wordIndex;

    // Remove this tile from selection
    selection.splice(removeAt, 1);

    // Clear its flags
    tile.used      = false;
    tile.wordIndex = null;
    tile.el.classList.remove("chosen");

    // Recompute wordIndex for all tiles still in the selection
    selection.forEach((t, idx) => {
      t.wordIndex = idx;
    });

    updateCurrentSelectionUI();

    return;
  }

  // CASE 2 — Tile not used: add to end of word
  if (selection.length >= 5)
    return;

  tile.used = true;
  tile.wordIndex = selection.length;
  tile.el.classList.add("chosen");

  selection.push(tile);

  updateCurrentSelectionUI();
}

function rebuildSelectionUI() {
  currentSel.innerHTML = "";

  selection.forEach(tile => {
    const upper      = tile.letter.toUpperCase();
    const frames     = letterFrames[upper];
    const firstFrame = frames ? frames[0] : "";

    const img          = getCachedImage(upper, firstFrame);
    img.className      = "small-tile";
    img.dataset.letter = tile.letter;

    currentSel.appendChild(img);

    if (frames) {
      startMiniAnimation(img, upper, frames);
    }
  });
}

function updateCurrentSelectionUI() {
  // If sizes differ, rebuild completely (rare case)
  if (currentSel.children.length !== selection.length) {
    rebuildSelectionUI();
    return;
  }

  // Otherwise update only changed tiles
  for (let i = 0; i < selection.length; ++i) {
    const tile = selection[i];
    const img  = currentSel.children[i];

    const upper      = tile.letter.toUpperCase();
    const frames     = letterFrames[upper];
    const firstFrame = frames ? frames[0] : "";
    const desiredSrc = getCachedImage(upper, firstFrame).src;

    // If the displayed image does not match the tile, update it
    if (img.dataset.letter !== tile.letter) {
      img.src            = desiredSrc;
      img.dataset.letter = tile.letter;

      if (frames) {
        startMiniAnimation(img, upper, frames);
      }
    }
  }
}

function clearSelection() {
  selection.forEach(t => {
    t.used = false;
    t.el.classList.remove("chosen");
  });

  selection = [];
  updateCurrentSelectionUI();
}

function backspaceSelection() {
  if (selection.length === 0)
    return;

  const t = selection.pop();
  t.used  = false;

  t.el.classList.remove("chosen");
  updateCurrentSelectionUI();
}

function decodeList(list) {
  return list.map(decodeWord);
}

function getDecodedWordLists() {
  return {
    "3": decodeList(serverData.subwords["3"] || []),
    "4": decodeList(serverData.subwords["4"] || []),
    "5": decodeList(serverData.subwords["5"] || [])
  };
}

function getCandidateLists() {
if (!serverData)
  return { "3": [], "4": [], "5": [] };

  return getDecodedWordLists();
}

function checkAndAddSelection() {
  const word = selection.map(t => t.letter).join("");
  if (word.length < 3) {
    // nothing to check
    animateWrong();
    return;
  }

  const candidates = getCandidateLists();
  const len        = word.length.toString();

  if (candidates[len] && candidates[len].includes(word)) {
    // good word - check it is not already found
    if (found[len].includes(word)) {
      // already found -> give feedback
      flashMessage("Already found");
    } else {
      found[len].push(word);
      renderFoundWord(word, parseInt(len, 10));
      updateCounts();

      // VALID word → enable all tiles
      selection.forEach(t => {
        // reset only the tile's chosen/chosen-style state
        t.used = false;
        t.el.classList.remove("chosen");
        t.el.style.opacity = "1";
        t.el.style.pointerEvents = "auto";
      });

      selection = [];
      updateCurrentSelectionUI();
      // check for completion
      maybeGoalReached();
    }
  } else {
    // wrong: shake the grid
    animateWrong();
  }
}

function animateWrong() {
  grid.classList.add("shake");
  setTimeout(() => {
    grid.classList.remove("shake");
  }, 700);
}

function flashMessage(msg) {
  // simple alert for now
  alert(msg);
}

function maybeGoalReached() {
  const goal3Reached = found["3"].length >= goalPerCol;
  const goal4Reached = found["4"].length >= goalPerCol;
  const goal5Reached = found["5"].length >= goalPerCol;

  const goal3Exceeded = found["3"].length > goalPerCol;
  const goal4Exceeded = found["4"].length > goalPerCol;
  const goal5Exceeded = found["5"].length > goalPerCol;

  goalReached  = goal3Reached && goal4Reached && goal5Reached;
  goalExceeded = goal3Exceeded && goal4Exceeded && goal5Exceeded;

  if (goalReached) {
    if (!goalExceeded)
      setTimeout(()=> alert("Goal reached!"), 200);
  }
}

// HINT behavior: reveal one character
function hintAction() {

  // If current selection already has 5 letters → cannot hint
  if (selection.length >= 5) {
    animateWrong();
    return;
  }

  const candidates = getCandidateLists();

  // 1. Find which word lengths have not yet reached goalPerCol
  const eligibleLengths = ["3","4","5"].filter(
    len => found[len].length < goalPerCol
  );

  // 2. Build remaining-words list depending on which mode we are in:
  //    restricted to eligible lengths OR full list
  let remaining = [];
  let restrictedMode = eligibleLengths.length > 0;

  if (restrictedMode) {
    // Use only lengths that still need words
    for (const len of eligibleLengths) {
      remaining.push(
        ...candidates[len].filter(w => !found[len].includes(w))
      );
    }
  } else {
    // Use all remaining unused words
    remaining = [
      ...candidates["3"].filter(w => !found["3"].includes(w)),
      ...candidates["4"].filter(w => !found["4"].includes(w)),
      ...candidates["5"].filter(w => !found["5"].includes(w)),
    ];
  }

  // If no unused words exist at all
  if (remaining.length === 0) {
    flashMessage("All words have been used");
    return;
  }

  const prefix    = selection.map(t => t.letter).join("");
  const prefixLen = prefix.length;

  // If nothing selected yet → choose a random eligible word
  if (prefixLen === 0) {
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    const nextChar = pick[0];

    const tile = findUnusedTileForLetter(nextChar);
    if (tile)
      onTileClick(tile);

    return;
  }

  // 3. For 1–4 selected letters, restrict remaining list to prefix matches
  const prefixMatches = remaining.filter(
    w => w.startsWith(prefix) && w.length > prefixLen
  );

  // If no prefix match exists → shake (bad hint request)
  if (prefixMatches.length === 0) {
    animateWrong();
    return;
  }

  // 4. Determine the set of available letters on the board
  const unusedLetters = tiles
    .filter(t => !t.used && !t.el.classList.contains("found"))
    .map(t => t.letter);

  // 5. Keep only words whose next character is an unused letter
  const usable = prefixMatches.filter(w =>
    unusedLetters.includes(w[prefixLen])
  );

  // Should not happen often, but handle gracefully
  if (usable.length === 0) {
    animateWrong();
    return;
  }

  // Select one usable word at random:
  const chosenWord = usable[Math.floor(Math.random() * usable.length)];
  const nextChar = chosenWord[prefixLen];

  const tile = findUnusedTileForLetter(nextChar);
  if (tile)
    onTileClick(tile);
}

// Build UI from serverData
function buildBoardFromData(data) {
  clearBoardUI();
  serverData = data;

  // 'letters' is a derangement of 'blockword'
  let letters = data.letters; // already in upper-case

  letters.forEach((ch, i) => {
    makeTile(i, ch);
  });

  // reset found
  found = { "3": [], "4": [], "5": [] };

  list3.innerHTML = "";
  list4.innerHTML = "";
  list5.innerHTML = "";

  updateCounts();
}

function findUnusedTileForLetter(letter) {
  letter = letter.toLowerCase();
  return tiles.find(t =>
       !t.used
    && !t.el.classList.contains("found")
    && t.letter === letter
  ) || null;
}

// Check if two words have any character in the same position
function haveInSituChars(word1, word2) {
  for (let i = 0; i < word1.length; ++i) {
    if (word1[i] === word2[i]) {
        return true; // Found a match at the same position
    }
  }

  return false; // No matches
}

// Shuffle an array in-place using the Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

// Generate a derangement (no characters in the original positions)
function derangement(word) {
  let randomisedWord;

  while (true) {
    const charList = word.split("");    // Convert string to array
    shuffleArray(charList);             // Shuffle the array
    randomisedWord = charList.join(""); // Convert back to string

    if (!haveInSituChars(word, randomisedWord)) {
      return randomisedWord;            // Return if a valid derangement
    }

    // There are 133,496 derangements of 9 distinct characters
    // There are 362,880 permutations of 9 distinct characters
    // Therefore there is about a 1 in 3 chance of finding a derangement by shuffling into a permutation
    // The probability of needing more than 20 attempts to find a derangement =
    //   (1 - 133496/362880) ^ 20 ~ 1 chance in a 10,000; so is small.

    // Otherwise, repeat
  }
}

async function fetchNewBlockword() {
  try {
    const resp = await fetch(RANDOM_URL);
    if (!resp.ok)
      throw new Error("Fetch error");

    const json = await resp.json();

    // Derange the word:
    const deranged = derangement(decodeWord(json.blockword));

    // Letters from the deranged word:
    json.letters  = deranged.split("").map(ch => ch.toUpperCase());
    json.deranged = deranged;

    buildBoardFromData(json);

  } catch (err) {
    console.error(err);
    alert("Failed to fetch blockword");
  }
}

function getCachedImage(letter, suffix = "") {
  const key = `${letter}${suffix}`;
  const img = imageCache.get(key);

  return img ? img.cloneNode(true) : null;
}

async function preloadImages() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const tasks = [];

  letters.forEach(letter => {
    if (letterFrames[letter]) {
      // multi-frame letter: H or J
      letterFrames[letter].forEach(suffix => {
        const key = `${letter}${suffix}`;
        const url = `/static/fs/letters/th_${key}.jpg`;
        tasks.push(loadImage(key, url));
      });
    } else {
      // single-frame letter
      const key = letter;
      const url = `/static/fs/letters/th_${letter}.jpg`;
      tasks.push(loadImage(key, url));
    }
  });

  await Promise.all(tasks);
}

function loadImage(key, url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(key, img);
      resolve();
    };

    img.src = url;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // auto-load first game after preloading the images
  preloadImages().then(() => {
    fetchNewBlockword();
  });
});

// Button onClick events:
newBtn   .addEventListener("click", fetchNewBlockword);
cancelBtn.addEventListener("click", clearSelection);
backBtn  .addEventListener("click", backspaceSelection);
addBtn   .addEventListener("click", checkAndAddSelection);
hintBtn  .addEventListener("click", hintAction);

document.addEventListener('keydown', function(event) {
  key = event.key.toUpperCase();

  if (key === 'C') {
    cancelBtn.click();
  }
  else if (key === 'B') {
    backBtn.click();
  }
  else if (key === 'A') {
    addBtn.click();
  }
  else if (key === 'H') {
    hintBtn.click();
  }
});

function decodeWord(encoded) {
  const bytes = atob(encoded);
  let result = "";
  for (let i = 0; i < bytes.length; ++i) {
    result += String.fromCharCode(bytes.charCodeAt(i) ^ intTeg);
  }

  return result;
}


function makePopover(id, htmlText) {
  const el = document.getElementById(id);
  if (!el) return;

  // 1. Clean up existing instance to prevent "undefined" errors
  const existingPopover = bootstrap.Popover.getInstance(el);
  if (existingPopover) {
    existingPopover.dispose();
  }

  // 2. Initialize with combined triggers for Safari compatibility
  new bootstrap.Popover(el, {
    content: htmlText,
    html: true,
    trigger: 'focus', // Standard focus trigger
    sanitize: false,   // Necessary for your <i> tag
    container: 'body'  // Fixes Safari z-index/rendering bugs
  });
}
const contentInfo = `
  BlockWords is a fun game that allows you to play and learn, just like a child learns through play.</br></br>
  BlockWords provides challenges in which your goal is to find at least 10 words of 3, 4 and 5 letters using fingerspelled, visual representations of the letters.</br></br>
  Each letter may only be used once.</br></br>
  The used letters are highlighted.</br></br>
  Once you have found 10 words, you may continue to add more to the list, for practice.</br></br>
  After a while, which will vary for different people, you will start to read the images like letters.</br></br>

  The dictionary includes both British and American variations of some words.
`;

const contentPlaying = `
    Click/Select images from the 3x3 grid to make a word.<br><br>
    Re-select a letter to remove it from the position that it was placed in.<br><br>
    A hint may be used in this version without penalty, and you decide if and when you want to Check your selection.<br><br>
    The numbers in square brackets are the numbers of provided words that can possibly be made with the letters.<br><br>
    The keyboard may be used to activate the 'Clear', 'Add', 'Back' and 'Hint' buttons; C, A, B and H.
`;

makePopover("content-info"   , contentInfo);
makePopover("content-playing", contentPlaying);

})();
