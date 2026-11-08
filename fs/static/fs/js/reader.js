// fs/static/fs/js/reader.js
// Copyright © 2025 Dr. Raymond William Kennington Ph.D.

const sourceTextEl        = document.getElementById('sourceText');
const inputAreaEl         = document.getElementById('input-area');
const scrollStripEl       = document.getElementById('scroll-strip');
const displayHorizontalEl = document.getElementById('display-horizontal');
const displayVerticalEl   = document.getElementById('display-vertical');
const sizeSliderEl        = document.getElementById("card-size-slider");
const speedSliderEl       = document.getElementById("scroll-speed-slider");
const imageWidthEl        = document.getElementById("image-width");
const speedEl             = document.getElementById("speed");
const startBtn            = document.getElementById("start-btn");
const pauseBtn            = document.getElementById("pause-btn");
const stopBtn             = document.getElementById("stop-btn");
const checkBtn            = document.getElementById("check-btn");
const horizontalRect      = displayHorizontalEl.getBoundingClientRect();
const modeH               = document.getElementById('modeH');
const modeV               = document.getElementById('modeV');
const handImageEl         = document.getElementById('hand-image');
const modesEl             = document.getElementById('modes');
const typedTextEl         = document.getElementById('typed-text');
const duplicateCountEl    = document.getElementById('duplicate-count');
const letterCountEl       = document.getElementById('letter-count');

function initButtonStates() {
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn .disabled = true;
  checkBtn.disabled = true;
}

displayVerticalEl.classList.add('hidden');
initButtonStates();

const letterFrames = {
  H: ["0", "1", "2", "3", "4"],
  J: ["0", "1", "2"]
};

const firstFrameDurations = [
  { maxSpeed:  50     , duration: 3000 },
  { maxSpeed: 100     , duration: 2000 },
  { maxSpeed: Infinity, duration: 1000 },
];

const otherFrameDurations = [
  { maxSpeed:  50     , duration: 200 },
  { maxSpeed: 100     , duration: 150 },
  { maxSpeed: Infinity, duration: 100 }
];

const decimals = {
  '0' : "zero",
  '1' : "one",
  '2' : "two",
  '3' : "three",
  '4' : "four",
  '5' : "five",
  '6' : "six",
  '7' : "seven",
  '8' : "eight",
  '9' : "nine",
  '.' : "point"
}

// Get the root element of the CSS
const rootElement = document.documentElement;
// Get all computed styles for that element
const computedStyles = window.getComputedStyle(rootElement);
// Get the value of the specific CSS variable
const cardGap = parseInt(computedStyles.getPropertyValue('--card-gap'));

const animatedTiles = new Set(); // Which animated tiles are 'H' or 'J'

let initialScrollX = displayHorizontalEl.clientWidth;
let scrollX; // physical scroll position; initialised just before use

let letterWidth;
let prevSliderValue = null;
let letterAdvance   = null; /* calculated when known precisely */
let lastScrollX     = null;


let offsetIntoFirstTile = 0;

let speedImagesPerSec =  1;
let speedPxPerSec     = 30;

let isRunning     = false;
let isPaused      = false;
let lastTime      = null;
let letterQueue   = [];

let animationId         = null;
let animationVerticalId = null;

let scrollAccumulator = 0;

function getDurationForSpeed(speed, durations) {
  // Pick the first object where speed < maxSpeed
  return durations.find(d => speed < d.maxSpeed).duration;
}

function updateLetterWidthValues() {
  letterWidth = Math.max(48, parseInt(sizeSliderEl.value, 10));

  document.documentElement.style.setProperty('--card-width', `${letterWidth}px`);

  if (prevSliderValue !== null) {
    increasingCardWidth = letterWidth > prevSliderValue;
  }

  imageWidthEl.textContent = letterWidth;

  prevSliderValue = letterWidth;
  letterAdvance   = null; /* calculated when known precisely */
}

function updateScrollSpeedValues() {
  speedPxPerSec       = Math.max(10, parseInt(speedSliderEl.value, 10));
  speedEl.textContent = speedPxPerSec;
}

updateLetterWidthValues();
updateScrollSpeedValues();

sizeSliderEl.addEventListener("input", () => {
  updateLetterWidthValues();
});

speedSliderEl.addEventListener("input", () => {
  updateScrollSpeedValues();
});

function getColumnGap() {
  return parseFloat(
    getComputedStyle(scrollStripEl).columnGap || 0
  );
}

function resetVerticalImage() {
  const oldImg = displayVerticalEl.querySelector('img');
  if (oldImg)
    oldImg.remove();

  const img = document.createElement('img');
  img.id    = 'vertical-image';

  displayVerticalEl.appendChild(img);
}

function endOfReading() {
  isRunning = false;

  pauseBtn.textContent = 'Pause';

  cancelAnimationFrame(animationId);
  cancelAnimationFrame(animationVerticalId);

  animatedTiles.clear();

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn .disabled = true;
  checkBtn.disabled = false;

  inputAreaEl.style.display = 'block';

  displayHorizontalEl.classList.remove('hidden');
  displayVerticalEl  .classList.remove('hidden');

  modesEl.style.display = 'block';

  if (modeH.checked)
    handImageEl.style.display = 'block';

  if (modeV) { // Reset the image to be a white outline
    duplicateCountEl.hidden = true;
    // Remove any existing image
    resetVerticalImage();
  }

  requestAnimationFrame(() => {
    alert("You have finished reading the text. Time to check your results.");
  });
}

/*
======================================
|       BEGIN Buffering Images       |
======================================
*/

const imageBuffer = {
  cache   : new Map(), // src → HTMLImageElement
  loading : new Set(), // src currently loading
  maxAhead: 8
};

function preloadImage(src) {
  // Don't load the image into the cache if either already there or on its way there
  if (   imageBuffer.cache.has(src)
      || imageBuffer.loading.has(src))
    return;

  imageBuffer.loading.add(src); // This image is in the 'loading' state

  const img = new Image(); // In-memory <img>

  img.onload = () => {               // When loaded
    imageBuffer.cache.set(src, img); // Add to the cache
    imageBuffer.loading.delete(src); // Indicate no longer in the loading state
  };
  img.onerror = () => {
    imageBuffer.loading.delete(src);
  };
  img.src = src;
}

// Add as many images as is needed (and possible) to maintain the buffer
function maintainBuffer() {
  for (let i = 0; i < Math.min(imageBuffer.maxAhead, letterQueue.length); ++i) {
    preloadImage(letterQueue[i].src);
  }
}

/*
======================================
|       END  Buffering Images        |
======================================
*/

function registerAnimatedTile(img, letter) {
  if (!letter)
    return;

  const ch = letter.toUpperCase();

  if (   !letterFrames[ch]             // if not an animatable letter
      || letterFrames[ch].length <= 1)
    return;

  const speed = parseFloat(speedSliderEl.value); // current scroll speed factor

  const firstFrameDuration = getDurationForSpeed(speed, firstFrameDurations);
  const otherFrameDuration = getDurationForSpeed(speed, otherFrameDurations);
  console.log("performance.now(): " + performance.now());
  console.log("firstFrameDuration: " + firstFrameDuration);
  console.log("ch: " + ch);

  animatedTiles.add({
    img,
    letter  : ch,
    frames  : letterFrames[ch],
    index   : 0,
    nextTime: performance.now() + firstFrameDuration,
    firstFrameDuration,
    otherFrameDuration
  });
}

function unregisterAnimatedTile(verticalImageEl) {
  for (let tile of animatedTiles) {
    if (tile.img === verticalImageEl) {
      animatedTiles.delete(tile);
      return; // Exit once found and removed
    }
  }
}

function updateAnimatedTiles(time) {
  for (const tile of Array.from(animatedTiles)) {
    if (!tile.img.isConnected) {  // If not connected to the page; i.e. rendered
      animatedTiles.delete(tile);
      continue;
    }

    if (time < tile.nextTime)
      continue;

    // Advance frame (cycle)
    tile.index = (tile.index + 1) % tile.frames.length;

    tile.img.src =
      `/static/fs/letters/th_${tile.letter}${tile.frames[tile.index]}.jpg`;

    // Determine delay AFTER this frame
    const delay =
      tile.index === tile.frames.length - 1
        ? tile.firstFrameDuration   // pause on H4
        : tile.otherFrameDuration;  // normal frame

    // Resynchronise, don't catch up
    tile.nextTime = time + delay;
  }
}

/*
======================================
|      BEGIN Horizontal Display      |
======================================
*/

function ensureActualLetterAdvance() {
  if (letterAdvance !== null)
    return;

  const first = scrollStripEl.firstElementChild;
  if (!first)
    return;

  const gap = parseFloat(
    getComputedStyle(scrollStripEl).columnGap || 0
  );

  letterAdvance = first.offsetWidth + gap;
}

function addBufferedTile(item) {
  const cached = imageBuffer.cache.get(item.src);
  if (!cached)
    return false; // not ready yet

  const div     = document.createElement('div');
  div.className = 'letter-cell';

  const img = document.createElement('img');
  img.src   = cached.src;

  div          .appendChild(img);
  scrollStripEl.appendChild(div);

  ensureActualLetterAdvance();

  registerAnimatedTile(img, item.letter);

  return true;
}

function feedStrip() {
  maintainBuffer();

  if (letterQueue.length === 0)
    return;

  const stripRect  = scrollStripEl.getBoundingClientRect();
  const parentRect = displayHorizontalEl.getBoundingClientRect();

  if (stripRect.right < parentRect.right + 2 * letterWidth) {
    const item = letterQueue[0];
    if (addBufferedTile(item)) {
      letterQueue.shift();
    }
  }
}

function consumeOffscreenTiles() {
  const first = scrollStripEl.firstElementChild;
  if (!first) return;

  const firstRect  = first.getBoundingClientRect();
  const parentRect = displayHorizontalEl.getBoundingClientRect();

  if (firstRect.right <= parentRect.left) {
    const img = first.querySelector('img');
    unregisterAnimatedTile(img);

    const advance = first.offsetWidth + getColumnGap();

    scrollStripEl.removeChild(first);

    // COMPENSATE ONLY ONCE
    scrollX += advance;

    scrollStripEl.style.transform =
      `translateX(${scrollX}px)`;
  }
}

function animate(time) {
  console.log("animate sees scrollX =", scrollX);

  if (!isRunning)
    return;

  if (lastTime === null) {
    lastTime = time;
    animationId = requestAnimationFrame(animate);
    return;
  }

  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // Accumulate exact fractional movement
  scrollAccumulator += speedPxPerSec * delta;

  // Only apply whole pixels
  const pixelsToMove = Math.floor(scrollAccumulator);
  scrollAccumulator -= pixelsToMove;  // leave fractional part for next frame

  if (pixelsToMove > 0) {
    scrollX -= pixelsToMove;  // always move left

    const firstTile = scrollStripEl.firstElementChild;
    if (firstTile) {
      const firstTileLeft = firstTile.getBoundingClientRect().left;
      const stripLeft     = scrollStripEl.getBoundingClientRect().left;

      console.log("firstTileLeft: " + firstTileLeft);
      console.log("stripLeft: " + stripLeft);
      // clamp only if first tile is past the left edge
      if (firstTileLeft < stripLeft) {
        console.log("Before clamping: scrollX = " + scrollX);
        scrollX = Math.min(scrollX, 0);
      }
    }

    scrollStripEl.style.transform = `translateX(${scrollX}px)`;
  }

  feedStrip();
  consumeOffscreenTiles();
  updateAnimatedTiles(time);

  if (
         letterQueue.length            === 0
      && scrollStripEl.children.length === 0
  ) {
    endOfReading();
    return;
  }

  animationId = requestAnimationFrame(animate);
}

function startScrolling() {
  if (isRunning) // prevent double-start
    return;

  scrollX = initialScrollX;

  scrollStripEl.style.transform = `translateX(${scrollX}px)`;

  isRunning   = true;
  lastTime    = null;
  lastScrollX = null;

  scrollAccumulator = 0;

  animationId = requestAnimationFrame(animate);
}
/*
======================================
|      END   Horizontal Display      |
======================================
*/

/*
======================================
|      BEGIN Vertical Display        |
======================================
*/

let lastLetter     = null;
let duplicateCount = 0;

function updateDuplicateCounter(letter) {
  if (letter === lastLetter) {
    ++duplicateCount;
    duplicateCountEl.textContent = `${duplicateCount + 1}`;
    duplicateCountEl.hidden = false;
  } else {
    duplicateCount = 0;
    duplicateCountEl.hidden = true;
  }

  lastLetter = letter;
}

function calculateSecondsPerImage() {
  const speedFactor  = Math.max(10, parseInt(speedSliderEl.value, 10));

  timeForSpeedFactor10 = 3; // seconds

  return timeForSpeedFactor10 - (timeForSpeedFactor10 - 0.1) / 490 * (speedFactor - 10);
}

function addVerticalImage(item) {
  // Determine the receptacle for the image from its parent container.
  // It is necessary to calculate each time because the img element is removed and added
  // at the end of reading in order to keep the image centred in its container.
  // After adding the element and giving it the same 'id' that it had initially,
  // the variable verticalImageEl no long pointed to anything. Very difficult to spot.
  // "This is a classic DOM lifecycle bug, not a logic or animation error."

  const img = displayVerticalEl.querySelector('#vertical-image');
  if (!img)
    return

  unregisterAnimatedTile(img);

  const cached = imageBuffer.cache.get(item.src);
  if (!cached)
    return false; // not ready yet

  updateDuplicateCounter(item.letter?.toUpperCase());

  img.src = cached.src;

  registerAnimatedTile(img, item.letter);

  return true;
}

function feedDisplay() {
  maintainBuffer();

  if (letterQueue.length === 0)
    return false;

  // letterQueueLength > 0

  const item = letterQueue[0];

  if (addVerticalImage(item)) {
    letterQueue.shift();
    return true;
  }

  return false;
}

function animateVertical(time) {
  if (!isRunning) // Required for a "Pause"
    return;

  if (lastTime === null) {
    lastTime = time;
  }

  // Always update animations regardless of vertical image timing
  updateAnimatedTiles(time);

  // Now handle the vertical image stepping
  const delta = time - lastTime;

  if (delta >= calculateSecondsPerImage() * 1000) {
    if (letterQueue.length > 0 && feedDisplay()) {
      lastTime = time;
    } else if (letterQueue.length === 0) {
      lastTime = null;
      endOfReading();
      return;
    }
  }

  animationVerticalId = requestAnimationFrame(animateVertical);
}

function startDisplaying() {
  console.log("startDisplaying");
  if (isRunning) // prevent double-start
    return;

  isRunning  = true;
  lastTime   = null;

  lastLetter     = null;
  duplicateCount = 0;

  duplicateCountEl.hidden = true;

  animateVerticalId = requestAnimationFrame(animateVertical);
}

/*
======================================
|      END   Vertical Display        |
======================================
*/

function queueImage(src, letter = null) {
  letterQueue.push({ src, letter });
}

function addCharacters(text) {
  let haveDecimal = false;

  for (let ch of text) {
    if (ch === ' ') {
      haveDecimal = false;
      queueImage(`/static/fs/letters/blank.jpg`, ch);
    }
    else if (/[0-9.]/.test(ch)) {
      if (ch === '.') {
        queueImage(`/static/fs/letters/blank.jpg`, ch);
      } else {
        haveDecimal = true;

        queueImage(`/static/fs/letters/blank.jpg`, ' ');
      }

      for (let d of decimals[ch]) // if ch == '.' then the loop will be empty
        queueImage(`/static/fs/letters/th_${d.toUpperCase()}${letterFrames[d]?.[0] ?? ''}.jpg`, d.toUpperCase());
    }
    else if (/[^a-zA-Z]/.test(ch)) {
      if (haveDecimal) {
        haveDecimal = false;
      }

      queueImage(`/static/fs/letters/blank.jpg`, ' '); // Output a blank for !@$%^& etc.
    }
    else { // Alphabetic characters
      if (haveDecimal) {
        haveDecimal = false;
        queueImage(`/static/fs/letters/blank.jpg`, ' ');
      }

      if (/H|J/.test(ch.toUpperCase())) {
          // First frame: Pass the letter for animation
          queueImage(`/static/fs/letters/th_${ch.toUpperCase()}0.jpg`, ch.toUpperCase());
      } else {
          // Other letters: Just one static image
          queueImage(`/static/fs/letters/th_${ch.toUpperCase()}.jpg`, ch.toUpperCase());
      }
    }
  }
}

function start() {
  if (isRunning)
    return;

  if (sourceTextEl.value.length === 0) {
    alert('Please paste some text into the field labelled "Paste text"');
    return;
  }

  scrollStripEl.innerText = '';

  modesEl    .style.display = 'none';
  handImageEl.style.display = 'none';
  handImageEl.style.display = 'none';

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn .disabled = false;
  checkBtn.disabled = true;

  isPaused  = false;
  isRunning = false;

  pauseBtn.textContent = 'Pause';

  rawText = sourceTextEl.value.normalize('NFKD');

  const charactersToFingerSpell = rawText
                                  .replace(/\r?\n+/g, ' ')
                                  .replace(/[^a-zA-Z0-9. ]/g, '');

  letterQueue = [];

  addCharacters(charactersToFingerSpell);

  inputAreaEl.style.display = 'none';

  typedTextEl.value = '';
  animatedTiles.clear();

  if (modeH.checked) {
    displayVerticalEl.classList.add('hidden');
    startScrolling();
  }
  else
  {
    displayHorizontalEl.classList.add('hidden');
    startDisplaying();
  }
}

function pause() {
  if (isPaused) { // Resume
    if (isRunning)
      return;

    pauseBtn.textContent = 'Pause';

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn .disabled = false;
    checkBtn.disabled = true;

    isPaused  = false;
    isRunning = true;
    lastTime  = null;

    if (modeH.checked)
      animationId = requestAnimationFrame(animate);
    else
      animationVerticalId = requestAnimationFrame(animateVertical);

  } else { // not paused
    if (!isRunning)
      return;

    isPaused  = true;
    isRunning = false;

    pauseBtn.textContent = 'Resume';

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn .disabled = false;
    checkBtn.disabled = true;
  }
}

function stop() {
  isRunning = false;

  pauseBtn.textContent = 'Pause';

  cancelAnimationFrame(animationId);
  cancelAnimationFrame(animationVerticalId);

  if (modeH)
    scrollStripEl.innerText = '';
  else {
    duplicateCountEl.hidden = true;
    resetVerticalImage();
  }

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn .disabled = true;
  checkBtn.disabled = false;

  displayHorizontalEl.classList.remove('hidden');
  displayVerticalEl  .classList.remove('hidden');

  if (modeH.checked)
    handImageEl.style.display = 'block';

  animatedTiles.clear();

  modesEl    .style.display = 'block';
  inputAreaEl.style.display = 'block';

  typedTextEl.value = '';
}

function checkTheResults() {
  if (typedTextEl.value.length === 0) {
    alert('No text was typed, so nothing to check.');
    return;
  }

  alert('Check your typed words with the pasted text.');
}

function check() {
  // No buttons change till after checking
  checkTheResults();

  scrollStripEl.innerText = '';

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn .disabled = true;
  checkBtn.disabled = true;
}

startBtn.onclick = start;
pauseBtn.onclick = pause;
stopBtn .onclick = stop;
checkBtn.onClick = check;

modeH.addEventListener("click", () => {
  displayHorizontalEl.classList.remove('hidden');
  displayVerticalEl  .classList.add   ('hidden');

  handImageEl.style.display = 'block';
});

modeV.addEventListener("click", () => {
  displayHorizontalEl.classList.add   ('hidden');
  displayVerticalEl  .classList.remove('hidden');

  handImageEl.style.display = 'none';
});

sourceTextEl.addEventListener("input", () => {
  letterCountEl.textContent = sourceTextEl.value.length.toLocaleString();
});

function makePopover(id, htmlText) {
  new bootstrap.Popover(document.getElementById(id), {
    content: htmlText,
    html: true
  });
}

const contentTheText = `
Provide the text to use for reading fingerspelled words using one of the following.</br></br>

Select the text area so that it has a bluish boundary, and then:</br></br>

1. Type in the text</br>
2. Right-click and choose 'Paste'</br>
3. Ctrl+V</br></br>

Adjust the slider values for size of images and speed and click the 'Start' button.</br></br>

You may just read or you can type what you see into the typing area, and then at the end check what you have typed.

Suggestions:</br></br>

1. Paste proper names of people, places, cities/towns, or similar and practice reading repeatedly, increasing speed when ready.</br></br>

2. Paste emails, letters, poems, nursery rhymes, books, etc., and read it in fingerspelling characters.
`;

makePopover("content-the-text", contentTheText);
