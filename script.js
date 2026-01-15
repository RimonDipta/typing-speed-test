const quotes = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "Typing fast is fun and easy.",
    "Practice makes perfect in coding.",
    "Hello world, welcome to speed typing.",
    "Better late than never.",
  ],
  medium: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Web development is a constantly evolving field with new technologies emerging daily.",
    "Debugging is like being the detective in a crime movie where you are also the murderer.",
    "Learn as if you were to live forever, live as if you were to die tomorrow.",
  ],
  hard: [
    "JavaScript provides powerful tools for dynamic web development.",
    "Frontend frameworks like React enhance user experience significantly.",
    "Complexity is the enemy of execution and clarity drives efficiency.",
    "To be or not to be, that is the question.",
    "Consistency is the key to mastering any skill in life.",
  ],
};

const quoteEl = document.getElementById("quote");
const inputEl = document.getElementById("input");
const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const resultsEl = document.getElementById("results");
const bestScoreEl = document.getElementById("bestScore");
const difficultyEl = document.getElementById("difficulty");
const containerEl = document.querySelector(".container");

let timer;
let timeLeft = 30;
let charIndex = 0;
let mistakes = 0;
let isPlaying = false;
let startTime;

function loadQuote() {
  const difficulty = difficultyEl.value;
  const arr = quotes[difficulty] || quotes.easy;
  const quote = arr[Math.floor(Math.random() * arr.length)];
  quoteEl.innerHTML = "";
  quote.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("char");
    quoteEl.appendChild(span);
  });
}

function startTest() {
  if (isPlaying) {
    clearInterval(timer);
    isPlaying = false;
  }

  isPlaying = true;
  charIndex = 0;
  mistakes = 0;
  timeLeft = 30;
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();

  // Visual cleanups
  wpmEl.textContent = "0";
  accEl.textContent = "100%";
  timeEl.textContent = timeLeft;
  if (containerEl) containerEl.classList.remove("shake");

  loadQuote();
  startTime = new Date();

  startBtn.style.display = "none";
  restartBtn.style.display = "inline-block";

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) finishTest();
  }, 1000);
}

function finishTest() {
  clearInterval(timer);
  inputEl.disabled = true;
  isPlaying = false;

  const elapsed = (30 - timeLeft) / 60;
  const safeElapsed = elapsed === 0 ? 0.0001 : elapsed;

  const wpm = Math.round(charIndex / 5 / safeElapsed);
  const accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100) || 0;

  saveResult(Math.max(0, wpm), accuracy);
  updateScoreboard();
}

function restartTest() {
  clearInterval(timer);
  isPlaying = false;
  startTest();
}

function updateStats() {
  const currentTime = new Date();
  const elapsed = (currentTime - startTime) / 60000;

  if (elapsed <= 0) return;

  const wpm = Math.round(charIndex / 5 / elapsed) || 0;
  const accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100) || 0;

  wpmEl.textContent = wpm;
  accEl.textContent = `${accuracy}%`;
}

inputEl.addEventListener("input", () => {
  if (!isPlaying) return;

  const chars = quoteEl.querySelectorAll(".char");
  const typedChar = inputEl.value.slice(-1);

  // Partial Backspace Handling
  if (inputEl.value.length < charIndex) {
    charIndex--;
    if (charIndex >= 0 && chars[charIndex]) {
      chars[charIndex].classList.remove("correct", "incorrect");
      chars[charIndex].classList.remove("current-char");
      chars[charIndex].classList.add("current-char");
    }
    return;
  }

  if (charIndex < chars.length) {
    if (typedChar === chars[charIndex].textContent) {
      chars[charIndex].classList.add("correct");
      chars[charIndex].classList.remove("current-char");
    } else {
      chars[charIndex].classList.add("incorrect");
      mistakes++;
      if (containerEl) {
        containerEl.classList.add("shake");
        setTimeout(() => containerEl.classList.remove("shake"), 500);
      }
    }
    charIndex++;

    // Check if finished IMMEDIATELY
    if (charIndex >= chars.length) {
      finishTest();
      return;
    }

    // Highlight next char
    if (charIndex < chars.length) {
      chars[charIndex].classList.add("current-char");
    }

    updateStats();
  }
});

function saveResult(wpm, accuracy) {
  const past = JSON.parse(localStorage.getItem("typingResults")) || [];
  const newRes = { wpm, accuracy, date: new Date().toLocaleDateString() };
  past.push(newRes);
  localStorage.setItem("typingResults", JSON.stringify(past));

  // update best
  const best = JSON.parse(localStorage.getItem("bestScore")) || {
    wpm: 0,
    accuracy: 0,
  };
  if (wpm > best.wpm) {
    localStorage.setItem("bestScore", JSON.stringify(newRes));
  }
}

function updateScoreboard() {
  if (!resultsEl) return;
  resultsEl.innerHTML = "";
  const past = JSON.parse(localStorage.getItem("typingResults")) || [];
  past
    .slice(-5)
    .reverse()
    .forEach((res) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${res.wpm} WPM</span> <span>${
        res.accuracy
      }%</span> <span style="font-size:0.8em; opacity:0.7">${
        res.date || "-"
      }</span>`;
      resultsEl.appendChild(li);
    });

  const best = JSON.parse(localStorage.getItem("bestScore"));
  if (bestScoreEl) {
    if (best && best.wpm !== undefined) {
      bestScoreEl.textContent = `${best.wpm} WPM | ${best.accuracy}%`;
    } else {
      bestScoreEl.textContent = "No record yet";
    }
  }
}

// Initial Setup
if (startBtn) startBtn.addEventListener("click", startTest);
if (restartBtn) restartBtn.addEventListener("click", restartTest);
updateScoreboard();
