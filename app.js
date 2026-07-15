// TicTacToe CloudPhone — full app with home menu, themes, keypad controls, help/about

let N = 3;
let board = [];
let turn = 'X';
let gameOver = false;
let scores = {X:0,O:0,draw:0};
let mode = 'single';
let difficultyDepth = 3;
let selectedIndex = 0;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoreEl = document.getElementById('score');
const modeSel = document.getElementById('mode');
const gridSel = document.getElementById('gridSize');
const themeSel = document.getElementById('theme');

// Page navigation
function openPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// Start new game
function startGame(){
  mode = modeSel.value;
  N = parseInt(gridSel.value,10);
  setSize(N);
  resetGame();
  openPage('gamePage');
}

// Theme
function applyTheme(name){
  document.documentElement.className = 'theme-' + name;
}

// Board setup
function setSize(n){
  N = n;
  boardEl.style.gridTemplateColumns = `repeat(${N},1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${N},1fr)`;
  document.documentElement.style.setProperty('--grid-size', N);
  createBoard();
}

function createBoard(){
  board = Array(N*N).fill(null);
  boardEl.innerHTML = '';
  for(let i=0;i<N*N;i++){
    const c = document.createElement('div');
    c.className = 'cell';
    c.dataset.index = i;
    c.addEventListener('click', ()=>makeMove(i,turn));
    boardEl.appendChild(c);
  }
  selectedIndex = 0;
  highlightSelected();
}

// Keypad controls
document.addEventListener('keydown', handleKeypad);

function handleKeypad(e){
  if(gameOver) return;
  const key = e.key;
  if(key==='2'){ moveSelection(-N); }      // up
  else if(key==='8'){ moveSelection(N); }  // down
  else if(key==='4'){ moveSelection(-1); } // left
  else if(key==='6'){ moveSelection(1); }  // right
  else if(key==='5'){ onCellClickKeypad(); } // drop
}

function moveSelection(delta){
  const newIndex = selectedIndex + delta;
  if(newIndex>=0 && newIndex<board.length){
    selectedIndex = newIndex;
    highlightSelected();
  }
}

function highlightSelected(){
  const cells = boardEl.children;
  for(let i=0;i<cells.length;i++){
    cells[i].classList.toggle('selected', i===selectedIndex);
  }
}

function onCellClickKeypad(){
  if(board[selectedIndex]||gameOver) return;
  if(mode==='local'){ makeMove(selectedIndex,turn); return; }
  makeMove(selectedIndex,'X');
  if(!gameOver){
    setTimeout(()=>{
      const ai = bestMove(board.slice(),'O',difficultyDepth);
      if(ai>=0) makeMove(ai,'O');
    },200);
  }
}

// Gameplay
function makeMove(idx,who){
  if(board[idx]||gameOver) return;
  board[idx] = who;
  updateUI();
  const winner = checkWinner(board);
  if(winner){
    gameOver = true;
    if(winner==='draw'){ status('Draw'); scores.draw++; }
    else{ status(`${winner} wins`); scores[winner]++; }
    updateScore();
    return;
  }
  if(mode==='local'){ turn = (turn==='X')?'O':'X'; status(`${turn}'s turn`); }
}

function updateUI(){
  const cells = boardEl.children;
  for(let i=0;i<cells.length;i++){
    const v = board[i];
    cells[i].textContent = v?v:'';
    cells[i].classList.toggle('disabled', !!v||gameOver);
    cells[i].classList.toggle('mark-x', v==='X');
    cells[i].classList.toggle('mark-o', v==='O');
  }
  highlightSelected();
}

function resetGame(){
  board = Array(N*N).fill(null);
  turn = 'X'; gameOver = false;
  updateUI();
  status('New game');
}

function status(txt){ statusEl.textContent = txt; }
function updateScore(){ scoreEl.textContent = `X: ${scores.X}  O: ${scores.O}  Draws: ${scores.draw}`; }

// Win check: always 3-in-a-row
function checkWinner(b){
  const lines = generateLines(N,3);
  for(const line of lines){
    const vals = line.map(i=>b[i]);
    if(vals.every(v=>v==='X')) return 'X';
    if(vals.every(v=>v==='O')) return 'O';
  }
  if(b.every(Boolean)) return 'draw';
  return null;
}

// Generate all possible 3-in-a-row lines for NxN
function generateLines(N,L){
  const lines=[];
  // rows
  for(let r=0;r<N;r++){
    for(let c=0;c<=N-L;c++){
      const line=[]; for(let k=0;k<L;k++) line.push(r*N+(c+k));
      lines.push(line);
    }
  }
  // cols
  for(let c=0;c<N;c++){
    for(let r=0;r<=N-L;r++){
      const line=[]; for(let k=0;k<L;k++) line.push((r+k)*N+c);
      lines.push(line);
    }
  }
  // diag down-right
  for(let r=0;r<=N-L;r++){
    for(let c=0;c<=N-L;c++){
      const line=[]; for(let k=0;k<L;k++) line.push((r+k)*N+(c+k));
      lines.push(line);
    }
  }
  // diag up-right
  for(let r=L-1;r<N;r++){
    for(let c=0;c<=N-L;c++){
      const line=[]; for(let k=0;k<L;k++) line.push((r-k)*N+(c+k));
      lines.push(line);
    }
  }
  return lines;
}

// AI: minimax with depth limit
function bestMove(boardState, aiPlayer, maxDepth){
  const human = aiPlayer==='X'?'O':'X';
  let bestScore=-Infinity, move=-1;
  for(let i=0;i<boardState.length;i++){
    if(!boardState[i]){
      boardState[i]=aiPlayer;
      const score=minimax(boardState,0,false,aiPlayer,human,maxDepth);
      boardState[i]=null;
      if(score>bestScore){ bestScore=score; move=i; }
    }
  }
  return move;
}

function minimax(bState,depth,isMax,ai,hu,maxDepth){
  const winner=checkWinner(bState);
  if(winner===ai) return 100-depth;
  if(winner===hu) return depth-100;
  if(winner==='draw') return 0;
  if(depth>=maxDepth) return heuristic(bState,ai,hu);
  const empties=[]; for(let i=0;i<bState.length;i++) if(!bState[i]) empties.push(i);
  if(isMax){
    let best=-Infinity;
    for(const i of empties){
      bState[i]=ai;
      best=Math.max(best,minimax(bState,depth+1,false,ai,hu,maxDepth));
      bState[i]=null;
    }
    return best;
  }else{
    let best=Infinity;
    for(const i of empties){
      bState[i]=hu;
      best=Math.min(best,minimax(bState,depth+1,true,ai,hu,maxDepth));
      bState[i]=null;
    }
    return best;
  }
}

function heuristic(bState,ai,hu){
  let score=0;
  const lines=generateLines(N,3);
  for(const line of lines){
    const vals=line.map(i=>bState[i]);
    const aiCount=vals.filter(v=>v===ai).length;
    const huCount=vals.filter(v=>v===hu).length;
    if(huCount===0&&aiCount>0) score+=aiCount;
    if(aiCount===0&&huCount>0) score-=huCount;
  }
  return score;
}
