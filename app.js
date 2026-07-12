// app.js - variable-size TicTacToe (3x3,4x4,5x5), local & vs CPU, themes, sounds
let N = 3;                 // board size (3,4,5)
let winLen = 3;            // required in-a-row to win (set to N for 4/5)
let board = [];
let turn = 'X';
let gameOver = false;
let scores = {X:0,O:0,draw:0};
let mode = 'single';       // 'single' or 'local'
let difficultyDepth = 3;
let muted = false;

// DOM
const statusEl = document.getElementById('status');
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const modeSel = document.getElementById('mode');
const sizeSel = document.getElementById('size');
const diffSel = document.getElementById('difficulty');
const themeSel = document.getElementById('theme');
const newBtn = document.getElementById('newBtn');
const muteBtn = document.getElementById('muteBtn');

function init(){
  applyTheme(themeSel.value);
  attachControls();
  setSize(parseInt(sizeSel.value,10));
  resetGame();
  playSound('start');
}

function attachControls(){
  newBtn.addEventListener('click', resetGame);
  modeSel.addEventListener('change', e=> { mode = e.target.value; status(`Mode: ${mode}`); resetGame(); });
  sizeSel.addEventListener('change', e=> { setSize(parseInt(e.target.value,10)); resetGame(); });
  diffSel.addEventListener('change', e=> difficultyDepth = parseInt(e.target.value,10));
  themeSel.addEventListener('change', e=> applyTheme(e.target.value));
  muteBtn.addEventListener('click', ()=>{ muted = !muted; muteBtn.textContent = muted ? 'Unmute' : 'Mute'; });
}

function setSize(n){
  N = n;
  winLen = (N >= 4) ? N : 3; // 3 for 3x3, full length for 4x4/5x5
  boardEl.classList.remove('board-3','board-4','board-5');
  boardEl.classList.add(`board-${N}`);
  boardEl.style.width = `calc(var(--app-w) - 2 * var(--board-padding))`;
  createBoard();
}

function createBoard(){
  board = Array(N*N).fill(null);
  boardEl.innerHTML = '';
  for(let i=0;i<N*N;i++){
    const c = document.createElement('div');
    c.className = 'cell';
    c.dataset.index = i;
    c.addEventListener('click', onCellClick);
    boardEl.appendChild(c);
  }
  updateUI();
}

function onCellClick(e){
  const idx = parseInt(e.currentTarget.dataset.index,10);
  if(gameOver) return;
  if(board[idx]) return;
  if(mode === 'local'){
    makeMove(idx, turn);
    return;
  }
  // single player
  makeMove(idx, 'X');
  if(!gameOver){
    setTimeout(()=> {
      const ai = bestMove(board.slice(), 'O', difficultyDepth);
      if(ai >= 0) makeMove(ai, 'O');
    }, 180);
  }
}

function makeMove(idx, who){
  if(board[idx] || gameOver) return;
  board[idx] = who;
  updateUI();
  playSound('place');
  const winner = checkWinner(board);
  if(winner){
    gameOver = true;
    if(winner === 'draw'){ status('Draw'); scores.draw++; playSound('draw'); }
    else { status(`${winner} wins`); scores[winner]++; playSound('win'); highlightWin(winner); }
    updateScore();
    return;
  }
  // swap turn for local mode
  if(mode === 'local'){
    turn = (turn === 'X') ? 'O' : 'X';
    status(`${turn}'s turn`);
  } else {
    status(`Your turn`);
  }
}

function updateUI(){
  const cells = boardEl.children;
  for(let i=0;i<cells.length;i++){
    const v = board[i];
    cells[i].textContent = v ? v : '';
    cells[i].classList.toggle('disabled', !!v || gameOver);
    cells[i].classList.toggle('mark-x', v === 'X');
    cells[i].classList.toggle('mark-o', v === 'O');
    cells[i].classList.remove('win');
  }
}

function resetGame(){
  board = Array(N*N).fill(null);
  turn = 'X';
  gameOver = false;
  updateUI();
  status('New game');
}

// status and score
function status(txt){ statusEl.textContent = txt; }
function updateScore(){ scoreEl.textContent = `X: ${scores.X}  O: ${scores.O}  Draws: ${scores.draw}`; }

// winning logic for NxN with winLen
function checkWinner(b){
  const lines = generateLines(N, winLen);
  for(const line of lines){
    const vals = line.map(i => b[i]);
    if(vals.every(v => v === 'X')) return 'X';
    if(vals.every(v => v === 'O')) return 'O';
  }
  if(b.every(Boolean)) return 'draw';
  return null;
}

function highlightWin(winner){
  const lines = generateLines(N, winLen);
  for(const line of lines){
    const vals = line.map(i => board[i]);
    if(vals.every(v => v === winner)){
      for(const idx of line){
        const cell = boardEl.children[idx];
        if(cell) cell.classList.add('win');
      }
      return;
    }
  }
}

// generate all winning lines for NxN board and required length L
function generateLines(N, L){
  const lines = [];
  // rows
  for(let r=0;r<N;r++){
    for(let c=0;c<=N-L;c++){
      const line = [];
      for(let k=0;k<L;k++) line.push(r*N + (c+k));
      lines.push(line);
    }
  }
  // cols
  for(let c=0;c<N;c++){
    for(let r=0;r<=N-L;r++){
      const line = [];
      for(let k=0;k<L;k++) line.push((r+k)*N + c);
      lines.push(line);
    }
  }
  // diag down-right
  for(let r=0;r<=N-L;r++){
    for(let c=0;c<=N-L;c++){
      const line = [];
      for(let k=0;k<L;k++) line.push((r+k)*N + (c+k));
      lines.push(line);
    }
  }
  // diag up-right
  for(let r=L-1;r<N;r++){
    for(let c=0;c<=N-L;c++){
      const line = [];
      for(let k=0;k<L;k++) line.push((r-k)*N + (c+k));
      lines.push(line);
    }
  }
  return lines;
}

// AI: simple minimax with depth limit and heuristic for NxN
function bestMove(boardState, aiPlayer, maxDepth){
  const human = aiPlayer === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let move = -1;
  const empties = [];
  for(let i=0;i<boardState.length;i++) if(!boardState[i]) empties.push(i);
  // quick center/corner preference for speed
  if(empties.length === boardState.length){
    const center = Math.floor(boardState.length/2);
    if(boardState[center] === null) return center;
  }
  for(const i of empties){
    boardState[i] = aiPlayer;
    const score = minimax(boardState, 0, false, aiPlayer, human, maxDepth);
    boardState[i] = null;
    if(score > bestScore){ bestScore = score; move = i; }
  }
  return move;
}

function minimax(bState, depth, isMax, ai, hu, maxDepth){
  const winner = checkWinner(bState);
  if(winner === ai) return 1000 - depth;
  if(winner === hu) return depth - 1000;
  if(winner === 'draw') return 0;
  if(depth >= maxDepth) return heuristic(bState, ai, hu);

  const empties = [];
  for(let i=0;i<bState.length;i++) if(!bState[i]) empties.push(i);
  if(isMax){
    let best = -Infinity;
    for(const i of empties){
      bState[i] = ai;
      best = Math.max(best, minimax(bState, depth+1, false, ai, hu, maxDepth));
      bState[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for(const i of empties){
      bState[i] = hu;
      best = Math.min(best, minimax(bState, depth+1, true, ai, hu, maxDepth));
      bState[i] = null;
    }
    return best;
  }
}

// heuristic: count open lines and two-in-a-row opportunities
function heuristic(bState, ai, hu){
  let score = 0;
  const lines = generateLines(N, winLen);
  for(const line of lines){
    const vals = line.map(i => bState[i]);
    const aiCount = vals.filter(v => v === ai).length;
    const huCount = vals.filter(v => v === hu).length;
    const emptyCount = vals.filter(v => !v).length;
    if(huCount === 0 && aiCount > 0) score += Math.pow(10, aiCount);
    if(aiCount === 0 && huCount > 0) score -= Math.pow(8, huCount);
  }
  return score;
}

// simple WebAudio tones
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type){
  if(muted) return;
  try {
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    if(type === 'place'){ o.frequency.value = 880; g.gain.value = 0.06; o.type='sine'; }
    else if(type === 'win'){ o.frequency.value = 440; g.gain.value = 0.12; o.type='triangle'; }
    else if(type === 'draw'){ o.frequency.value = 260; g.gain.value = 0.06; o.type='sine'; }
    else if(type === 'start'){ o.frequency.value = 660; g.gain.value = 0.05; o.type='sawtooth'; }
    o.start(now); o.stop(now + 0.12);
  } catch(e){ /* audio may be blocked until user gesture */ }
}

// theme
function applyTheme(name){
  document.documentElement.className = 'theme-'+name;
}

// start
init();

