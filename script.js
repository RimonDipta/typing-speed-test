const quotes = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "Typing fast is fun and easy.",
    "Practice makes perfect in coding.",
  ],
  hard: [
    "JavaScript provides powerful tools for dynamic web development.",
    "Frontend frameworks like React enhance user experience significantly.",
    "Complexity is the enemy of execution and clarity drives efficiency.",
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

let timer;
let timeLeft = 30;
let charIndex = 0;
let mistakes = 0;
let isPlaying = false;
let startTime;

function loadQuote() {
  const difficulty = difficultyEl.value;
  const arr = quotes[difficulty];
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
  if (isPlaying) return;
  isPlaying = true;
  charIndex = 0;
  mistakes = 0;
  timeLeft = 30;
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();
  loadQuote();
  updateStats();
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
  const wpm = Math.round(charIndex / 5 / elapsed);
  const accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100) || 0;

  saveResult(wpm, accuracy);
  updateScoreboard();
}

function restartTest() {
  quoteEl.classList.add("highlight");
  setTimeout(() => quoteEl.classList.remove("highlight"), 500);
  clearInterval(timer);
  startTest();
}

function updateStats() {
  const elapsed = (new Date() - startTime) / 60000;
  const wpm = Math.round(charIndex / 5 / elapsed) || 0;
  const accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100) || 0;
  wpmEl.textContent = wpm;
  accEl.textContent = accuracy;
}

inputEl.addEventListener("input", () => {
  const chars = quoteEl.querySelectorAll(".char");
  const typedChar = inputEl.value.slice(-1);

  if (charIndex < chars.length) {
    if (typedChar === chars[charIndex].textContent) {
      chars[charIndex].classList.add("correct");
    } else {
      chars[charIndex].classList.add("incorrect");
      mistakes++;
    }
    charIndex++;
    updateStats();
  } else {
    finishTest();
  }
});

startBtn.addEventListener("click", startTest);
restartBtn.addEventListener("click", restartTest);

function saveResult(wpm, accuracy) {
  const past = JSON.parse(localStorage.getItem("typingResults")) || [];
  const newRes = { wpm, accuracy, date: new Date().toLocaleString() };
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
  resultsEl.innerHTML = "";
  const past = JSON.parse(localStorage.getItem("typingResults")) || [];
  past
    .slice(-5)
    .reverse()
    .forEach((res) => {
      const li = document.createElement("li");
      li.textContent = `${res.wpm} WPM | ${res.accuracy}% | ${res.date}`;
      resultsEl.appendChild(li);
    });

  const best = JSON.parse(localStorage.getItem("bestScore"));
  if (best) {
    bestScoreEl.textContent = `${best.wpm} WPM | ${best.accuracy}% (${best.date})`;
  }
}

updateScoreboard();
