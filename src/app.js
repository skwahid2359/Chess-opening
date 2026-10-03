import { Chess } from "chess.js";
import { OPENINGS } from "./opening-data.js";
import { VARIATIONS } from "./variation-data.js";
import { STUDY_PATTERNS } from "./study-patterns.js";
import { BOARD_PUZZLES } from "./puzzle-data.js";

const $ = s => document.querySelector(s);
function readStored(key,fallback){
  try{
    const raw=localStorage.getItem(key);if(raw===null)return fallback;
    const value=JSON.parse(raw);
    if(Array.isArray(fallback))return Array.isArray(value)?value:fallback;
    if(fallback&&typeof fallback==="object")return value&&typeof value==="object"&&!Array.isArray(value)?value:fallback;
    return typeof value===typeof fallback?value:fallback;
  }catch(error){console.warn(`Stored data for ${key} could not be read; using a safe default.`,error);return fallback;}
}
const state = {
  chess: new Chess(), selected: null, flipped:false, opening:null, lesson:0, keyboardFocusSquare:null, restoreBoardFocus:false, lastMove:null, pendingPromotion:null,
  mode:"learn", filter:"all", redo:[], explorerToken:0, activeVariation:null, variationPly:0, lineProgress:readStored("coa_line_progress",{}), reviewCards:readStored("coa_review_cards",{}), patternFilter:"all", activePattern:null, patternAnswerVisible:false,
  puzzleFilter:"all", puzzleIndex:0, puzzleGame:null, puzzleSelected:null, puzzleRevealed:false, puzzleReviewMode:false, puzzleSolved:readStored("coa_puzzle_solved",[]), puzzleAttempts:readStored("coa_puzzle_attempts",{}), puzzleReviews:readStored("coa_puzzle_reviews",{}),
  stats: readStored("coa_stats",{"correct":0,"attempts":0,"streak":0,"mastered":0}),
  repertoire: readStored("coa_repertoire",[]),
  repertoireLines: readStored("coa_repertoire_lines",[]),
  customLines: readStored("coa_custom_lines",[]),
  studyNotes: readStored("coa_study_notes",{}),
  positionNotes: readStored("coa_position_notes",{})
};

const PIECES = {p:"♟",n:"♞",b:"♝",r:"♜",q:"♛",k:"♚",P:"♙",N:"♘",B:"♗",R:"♖",Q:"♕",K:"♔"};
const PIECE_NAMES={p:"pawn",n:"knight",b:"bishop",r:"rook",q:"queen",k:"king"};
function pieceMarkup(piece,extraClass="piece-art"){
  const color=piece.color==="w"?"white":"black",name=PIECE_NAMES[piece.type];
  return `<img class="${extraClass}" src="./pieces/${color}-${name}.svg" alt="" draggable="true" loading="eager">`;
}
function validateLine(moves){
  const game=new Chess();
  try{if(!Array.isArray(moves)||moves.length>500||moves.some(m=>typeof m!=="string"))throw new Error("Invalid move sequence shape");for(let i=0;i<moves.length;i++)game.move(moves[i]);return {valid:true,plies:moves.length};}
  catch(error){return {valid:false,plies:0,error:String(error?.message||error)};}
}
function sanitizeCustomLines(input){
  if(!Array.isArray(input))return [];
  const result=[],seen=new Set();
  for(const line of input.slice(0,300)){
    if(!line||typeof line!=="object"||Array.isArray(line)||typeof line.id!=="string"||!line.id.startsWith("custom-")||seen.has(line.id)||typeof line.name!=="string"||!line.name.trim()||!Array.isArray(line.moves))continue;
    if(line.moves.length<1||line.moves.length>500||!validateLine(line.moves).valid)continue;
    seen.add(line.id);result.push({...line,isCustom:true,name:line.name.trim().slice(0,100),moves:line.moves.slice(),idea:typeof line.idea==="string"?line.idea.slice(0,2000):"Custom study line",plans:Array.isArray(line.plans)?line.plans.filter(x=>typeof x==="string").slice(0,20):[],mistakes:Array.isArray(line.mistakes)?line.mistakes.filter(x=>typeof x==="string").slice(0,20):[],endgame:typeof line.endgame==="string"?line.endgame.slice(0,2000):""});
  }
  return result;
}
function sanitizeStringMap(input,maxLength){const out={};if(!input||typeof input!=="object"||Array.isArray(input))return out;for(const [key,value] of Object.entries(input).slice(0,5000)){if(typeof key==="string"&&typeof value==="string")out[key.slice(0,300)]=value.slice(0,maxLength);}return out;}
function sanitizeRecordMap(input,mapper){const out={};if(!input||typeof input!=="object"||Array.isArray(input))return out;for(const [key,value] of Object.entries(input).slice(0,5000)){if(!value||typeof value!=="object"||Array.isArray(value))continue;const clean=mapper(value);if(clean)out[key]=clean;}return out;}
function normalizeProgressState(){
  state.customLines=sanitizeCustomLines(state.customLines);
  state.repertoire=Array.isArray(state.repertoire)?[...new Set(state.repertoire.filter(id=>typeof id==="string"&&OPENINGS.some(o=>o.id===id)))]:[];
  state.repertoireLines=Array.isArray(state.repertoireLines)?[...new Set(state.repertoireLines.filter(id=>typeof id==="string"&&(VARIATIONS.some(v=>v.id===id)||state.customLines.some(v=>v.id===id))))]:[];
  state.studyNotes=sanitizeStringMap(state.studyNotes,3000);state.positionNotes=sanitizeStringMap(state.positionNotes,2000);
  state.lineProgress=sanitizeRecordMap(state.lineProgress,r=>({attempts:Math.max(0,Number(r.attempts)||0),correct:Math.max(0,Number(r.correct)||0),completed:!!r.completed}));
  state.reviewCards=sanitizeRecordMap(state.reviewCards,r=>Number.isFinite(Number(r.dueAt))?{...r,dueAt:Number(r.dueAt),repetitions:Math.max(0,Number(r.repetitions)||0),intervalDays:Math.max(0,Number(r.intervalDays)||0)}:null);
  state.puzzleSolved=Array.isArray(state.puzzleSolved)?[...new Set(state.puzzleSolved.filter(id=>typeof id==="string"&&BOARD_PUZZLES.some(p=>p.id===id)))]:[];
  const rawAttempts=state.puzzleAttempts;state.puzzleAttempts={};if(rawAttempts&&typeof rawAttempts==="object"&&!Array.isArray(rawAttempts))for(const [id,count] of Object.entries(rawAttempts)){if(BOARD_PUZZLES.some(p=>p.id===id)&&Number.isFinite(Number(count)))state.puzzleAttempts[id]=Math.max(0,Number(count));}
  state.puzzleReviews=sanitizeRecordMap(state.puzzleReviews,r=>Number.isFinite(Number(r.dueAt))?{...r,dueAt:Number(r.dueAt),repetitions:Math.max(0,Number(r.repetitions)||0),intervalDays:Math.max(0,Number(r.intervalDays)||0)}:null);
  const stats=state.stats&&typeof state.stats==="object"&&!Array.isArray(state.stats)?state.stats:{};
  state.stats={correct:Math.max(0,Number(stats.correct)||0),attempts:Math.max(0,Number(stats.attempts)||0),streak:Math.max(0,Number(stats.streak)||0),mastered:Math.max(0,Number(stats.mastered)||0)};
}
normalizeProgressState();
const variationValidation=new Map(VARIATIONS.map(v=>[v.id,validateLine(v.moves)]));
const openingValidation=new Map(OPENINGS.map(o=>[o.id,validateLine(o.moves)]));
let engineWorker=null,engineReady=false,engineBusy=false,pendingEngineAnalysis=null,engineUciReady=false,engineAwaitingSearchReady=false,engineCurrentFen=null,engineCurrentDepth=14,engineReportedName=null,engineLogLines=[],analyticsFilter="all",coverageFilter="all",lastEngineResult=null;
const COURSE_PATHS = [
  {id:"open-games",title:"1 · Open Games",level:"Foundation",description:"Develop quickly, fight for the center, and learn common e4/e5 structures.",openingIds:["italian","ruy","scotch","vienna","kings-gambit"]},
  {id:"black-vs-e4",title:"2 · Black vs 1.e4",level:"Foundation → Intermediate",description:"Build a Black repertoire with both solid and counterattacking responses.",openingIds:["sicilian","caro","french","scandinavian","pirc","modern","owen","petrov","elephant"]},
  {id:"queen-pawn",title:"3 · Queen's Pawn Systems",level:"Intermediate",description:"Study d4/c4 structures, central tension, development and pawn breaks.",openingIds:["qgd","qga","london","colle","slav","nimzo","grunfeld","kings-indian"]},
  {id:"flank-hypermodern",title:"4 · Flank & Hypermodern",level:"Intermediate → Advanced",description:"Explore flexible centers, fianchetto setups, gambits and counterplay.",openingIds:["english","reti","benoni","benko","budapest","albin","trompowsky"]},
  {id:"tactics-endgames",title:"5 · Tactics & Endgames",level:"All levels",description:"Apply tactical recognition and essential king-and-pawn endgame ideas on real positions.",puzzles:true}
];

function save(){
  localStorage.setItem("coa_stats",JSON.stringify(state.stats));
  localStorage.setItem("coa_repertoire",JSON.stringify(state.repertoire));
  localStorage.setItem("coa_repertoire_lines",JSON.stringify(state.repertoireLines));
  localStorage.setItem("coa_custom_lines",JSON.stringify(state.customLines));
  localStorage.setItem("coa_study_notes",JSON.stringify(state.studyNotes));
  localStorage.setItem("coa_position_notes",JSON.stringify(state.positionNotes));
  localStorage.setItem("coa_line_progress",JSON.stringify(state.lineProgress));
  localStorage.setItem("coa_review_cards",JSON.stringify(state.reviewCards));
  renderStats(); renderQueue(); renderSavedLineQueue(); renderCustomLineQueue(); renderList(); renderVariationLab(); renderCourseRoadmap(); renderOpeningAnalytics(); renderCurriculumCoverage();
}
function toast(t){ const x=$("#toast"); x.textContent=t; x.classList.add("show"); setTimeout(()=>x.classList.remove("show"),1500); }
function renderStats(){
  $("#masteredStat").textContent=state.stats.mastered;
  $("#accuracyStat").textContent=(state.stats.attempts?Math.round(state.stats.correct/state.stats.attempts*100):0)+"%";
  $("#streakStat").textContent=state.stats.streak;
  $("#repertoireStat").textContent=state.repertoire.length;
  const due=Object.values(state.reviewCards).filter(c=>c.dueAt<=Date.now()).length;
  const dueEl=$("#reviewDueStat"); if(dueEl)dueEl.textContent=due;
}
function renderQueue(){
  $("#queue").innerHTML = state.repertoire.length ? state.repertoire.map(id=>{
    const o=OPENINGS.find(x=>x.id===id); return `<button class="queue-item" data-id="${id}" title="Load saved opening"><span>${o?.name||id}</span><span>★</span></button>`;
  }).join("") : `<div class="muted">No openings saved yet. Select an opening and choose Repertoire to save it.</div>`;
  $("#queue").querySelectorAll("[data-id]").forEach(x=>x.onclick=()=>selectOpening(x.dataset.id));
}
function renderSavedLineQueue(){
  const el=$("#savedLineQueue");if(!el)return;
  const lines=state.repertoireLines.map(id=>VARIATIONS.find(v=>v.id===id)||state.customLines.find(v=>v.id===id)).filter(Boolean);
  el.innerHTML=lines.length?lines.map(v=>`<div class="saved-line-row"><button class="queue-item saved-line-load" data-line-id="${v.id}" title="Load saved variation"><span>${v.name}</span><span>↗</span></button><button class="saved-line-remove" data-remove-line="${v.id}" aria-label="Remove ${v.name}" title="Remove saved line">×</button></div>`).join(""):'<div class="muted">No variation lines saved yet. Choose a line and tap Save line.</div>';
  el.querySelectorAll("[data-line-id]").forEach(b=>b.onclick=()=>{const v=VARIATIONS.find(x=>x.id===b.dataset.lineId)||state.customLines.find(x=>x.id===b.dataset.lineId);if(!v)return;if(v.isCustom)loadCustomLine(v.id);else{state.activeVariation=v;state.opening=OPENINGS.find(o=>o.id===v.openingId)||state.opening;state.variationPly=0;loadActiveVariation();renderVariationLab();toast("Saved variation loaded.");}});
  el.querySelectorAll("[data-remove-line]").forEach(b=>b.onclick=()=>{state.repertoireLines=state.repertoireLines.filter(id=>id!==b.dataset.removeLine);save();toast("Saved line removed.");});
}
function deleteCustomLine(id){
  state.customLines=state.customLines.filter(x=>x.id!==id);state.repertoireLines=state.repertoireLines.filter(x=>x!==id);delete state.lineProgress[id];delete state.studyNotes[id];
  for(const key of Object.keys(state.positionNotes))if(key.startsWith(`${id}:`))delete state.positionNotes[key];
  for(const [key,card] of Object.entries(state.reviewCards))if(key.startsWith(`${id}:`)||card.variationId===id)delete state.reviewCards[key];
  if(state.activeVariation?.id===id){state.activeVariation=null;state.variationPly=0;}
  save();toast("Custom study line and its review data deleted.");
}
function renderCustomLineQueue(){
  const el=$("#customLineQueue");if(!el)return;
  el.innerHTML=state.customLines.length?state.customLines.map(line=>`<div class="custom-line-row"><button class="queue-item custom-line-load" data-custom-line="${line.id}" title="Load custom PGN line"><span>${escapeHtml(line.name)}</span><span>${line.moves.length} plies</span></button><button class="saved-line-remove" data-delete-custom-line="${line.id}" aria-label="Delete ${escapeHtml(line.name)}" title="Delete custom line">×</button></div>`).join(""):'<div class="muted">No custom PGN lines yet. Import a PGN and save it as a study line.</div>';
  el.querySelectorAll("[data-custom-line]").forEach(b=>b.onclick=()=>loadCustomLine(b.dataset.customLine));
  el.querySelectorAll("[data-delete-custom-line]").forEach(b=>b.onclick=()=>deleteCustomLine(b.dataset.deleteCustomLine));
}
function addStudyAnnotationsToGame(game,line){
  const base=OPENINGS.find(o=>o.id===line.id)||VARIATIONS.find(v=>v.id===line.id)||state.customLines.find(v=>v.id===line.id);
  const overall=(state.studyNotes[line.id]||base?.idea||base?.desc||"").trim();
  if(overall)game.setComment(overall.slice(0,3000));
  for(let i=0;i<line.moves.length;i++){
    game.move(line.moves[i]);
    const note=state.positionNotes[`${line.id}:${i+1}`];if(note)game.setComment(note.slice(0,2000));
  }
}
function exportFullRepertoirePgn(){
  const items=[];
  for(const id of state.repertoire){const opening=OPENINGS.find(o=>o.id===id);if(opening)items.push({id:opening.id,name:opening.name,moves:opening.moves,source:"Saved opening"});}
  for(const id of state.repertoireLines){const line=VARIATIONS.find(v=>v.id===id)||state.customLines.find(v=>v.id===id);if(line)items.push({id:line.id,name:line.name,moves:line.moves,source:"Saved line"});}
  for(const line of state.customLines)items.push({id:line.id,name:line.name,moves:line.moves,source:"Custom PGN line"});
  const unique=[...new Map(items.map(item=>[item.id,item])).values()];
  if(!unique.length){toast("Save an opening or study line first, then export your repertoire.");return;}
  const games=[],skipped=[];
  for(const item of unique){
    const check=validateLine(item.moves);if(!check.valid){skipped.push(item.name);continue;}
    try{const game=new Chess();game.header("Event","Chess Opening Academy Personal Repertoire");game.header("Site","Local Study");game.header("Opening",item.name);game.header("Annotator","Chess Opening Academy");for(const san of item.moves)game.move(san);games.push(game.pgn());}
    catch{skipped.push(item.name);}
  }
  if(!games.length){toast("No valid lines could be exported.");return;}
  const pgn=games.join("\n\n");$("#pgnInput").value=pgn;$("#pgnInput").focus();$("#pgnInput").select();
  const message=`Exported ${games.length} game(s)${skipped.length?`; skipped ${skipped.length} invalid line(s)`:""}.`;
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(pgn).then(()=>toast(`${message} PGN copied.`)).catch(()=>toast(`${message} PGN is in the text box.`));else toast(`${message} PGN is in the text box.`);
}

function saveCurrentGameAsCustomLine(){
  const moves=state.chess.history();if(!moves.length){toast("Load or play a game first, then save it as a study line.");return;}
  const importedComments=typeof state.chess.getComments==="function"?state.chess.getComments():[];
  const check=validateLine(moves);if(!check.valid){toast("This game cannot be replayed from the standard starting position.");return;}
  const suggested=state.opening?.name?`${state.opening.name} — Custom line`:`Custom PGN line ${state.customLines.length+1}`;
  const name=prompt("Name this study line:",suggested);if(name===null)return;const clean=name.trim().slice(0,100);if(!clean){toast("A line name is required.");return;}
  const line={id:`custom-${Date.now()}`,isCustom:true,name:clean,openingId:"custom-study",kind:"custom",moves,idea:"User-imported or user-played PGN line. Add personal notes to remember plans and candidate moves.",plans:["Replay the line and identify the purpose of each move.","Compare alternatives at critical positions before memorizing the sequence."],mistakes:["Do not assume the imported line is engine-approved.","Check for tactical alternatives and opponent deviations."],endgame:"Use the final position as a starting point for your own analysis; no engine evaluation is attached.",createdAt:new Date().toISOString()};
  state.customLines.push(line);
  if(importedComments.length){
    try{const replay=new Chess(),fenToPly=new Map([[replay.fen(),0]]);for(let i=0;i<moves.length;i++){replay.move(moves[i]);fenToPly.set(replay.fen(),i+1);}
      for(const item of importedComments){if(!item||typeof item.comment!=="string"||typeof item.fen!=="string")continue;const ply=fenToPly.get(item.fen);if(ply!==undefined)state.positionNotes[`${line.id}:${ply}`]=item.comment.slice(0,2000);}
    }catch(error){console.warn("Could not map imported PGN comments to positions",error);}
  }
  save();toast(importedComments.length?`Custom line saved with ${importedComments.length} imported PGN comment(s).`:"Custom study line saved.");
}
function loadCustomLine(id){
  const line=state.customLines.find(x=>x.id===id);if(!line)return;
  const check=validateLine(line.moves);if(!check.valid){toast("This saved line is invalid and cannot be loaded.");return;}
  state.activeVariation=line;state.opening={id:"custom-study",name:line.name,eco:"CUSTOM PGN",side:"other",desc:"Your imported personal study line. Review the sequence and add your own notes.",moves:line.moves,why:[line.idea]};state.lesson=0;state.variationPly=line.moves.length;applyMoves(line.moves);state.redo=[];renderAll();renderVariationLab();renderCustomLineQueue();loadExplorer();toast("Custom study line loaded.");
}

function saveActiveVariationLine(){
  const v=state.activeVariation;
  if(!v){toast("Select a variation first.");return;}
  const check=variationValidation.get(v.id)||validateLine(v.moves);
  if(!check.valid){toast("This variation is not valid and cannot be saved.");return;}
  if(!state.repertoireLines.includes(v.id)){state.repertoireLines.push(v.id);save();toast("Variation saved to your repertoire.");}
  else toast("This variation is already saved.");
}
function exportActiveVariationPGN(){
  const v=state.activeVariation;
  if(!v){toast("Select a variation first.");return;}
  const check=variationValidation.get(v.id)||validateLine(v.moves);
  if(!check.valid){toast("Invalid line cannot be exported.");return;}
  try{
    const game=new Chess();
    game.header("Event","Chess Opening Academy Study");game.header("Site","Chess Opening Academy");game.header("White",v.white||"White repertoire");game.header("Black",v.black||"Black repertoire");game.header("Opening",v.name);game.header("Annotator","Chess Opening Academy");
    for(const san of v.moves)game.move(san);
    const pgn=game.pgn();$("#pgnInput").value=pgn;
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(pgn).then(()=>toast("Variation PGN copied.")).catch(()=>toast("PGN placed in the field; copy it manually."));
    else toast("PGN placed in the field; copy it manually.");
  }catch(e){console.warn("Variation PGN export failed",e);toast("Could not export this line as PGN.");}
}

function setEngineStatus(text,badge){
  $("#engineStatus").textContent=text;if(badge)$("#engineBadge").textContent=badge;
}
function appendEngineLog(direction,message){
  const line=`${new Date().toLocaleTimeString()} ${direction}: ${String(message??"")}`;engineLogLines.push(line);if(engineLogLines.length>40)engineLogLines=engineLogLines.slice(-40);const log=$("#engineLog");if(log)log.textContent=engineLogLines.join("\n");
}
function sendEngineCommand(command){if(!engineWorker)return;appendEngineLog("→",command);engineWorker.postMessage(command);}
function checkEngineConnection(){if(engineReady){setEngineStatus(`Engine ready${engineReportedName?`: ${engineReportedName}`:""}.`,"Ready");return;}setEngineStatus("Checking engine worker and UCI handshake…","Checking");initEngine();}

function uciPvToSan(fen,uciMoves){
  try{
    const game=new Chess(fen),san=[];
    for(const token of uciMoves){if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(token))break;
      const move=game.move({from:token.slice(0,2),to:token.slice(2,4),...(token[4]?{promotion:token[4]}:{})});if(!move)break;san.push(move.san);
    }
    return san.join(" ");
  }catch{return "";}
}
function handleEngineMessage(raw){
  const line=String(raw??"").trim();
  if(line.startsWith("ENGINE_SOURCE ")){const source=line.slice("ENGINE_SOURCE ".length);setEngineStatus(`Engine assets loaded from ${source}.`,"Loading");appendEngineLog("info",`Engine source: ${source}`);return;}
  if(line.startsWith("ENGINE_LOAD_ERROR")){engineReady=false;engineBusy=false;engineWorker=null;pendingEngineAnalysis=null;setEngineStatus("Engine could not load. Check your connection and CDN access.","Load failed");$("#analyzePosition").disabled=false;$("#stopAnalysis").disabled=true;return;}
  if(line==="uciok"){engineUciReady=true;engineWorker?.postMessage("isready");return;}
  if(line==="readyok"){
    if(!engineReady){engineReady=true;setEngineStatus("Engine ready.","Ready");if(pendingEngineAnalysis){const pending=pendingEngineAnalysis;runEngineAnalysis(pending.fen,pending.depth);}return;}
    if(engineAwaitingSearchReady&&pendingEngineAnalysis){engineAwaitingSearchReady=false;engineCurrentFen=pendingEngineAnalysis.fen;engineCurrentDepth=pendingEngineAnalysis.depth;engineWorker?.postMessage(`position fen ${engineCurrentFen}`);engineWorker?.postMessage(`go depth ${engineCurrentDepth}`);return;}
    return;
  }
  if(line.startsWith("info ")){
    if(!engineBusy||!engineCurrentFen)return;
    const score=line.match(/\bscore (cp|mate) (-?\d+)/),depth=line.match(/\bdepth (\d+)/),pv=line.match(/\bpv (.+)$/);
    if(score){const label=score[1]==="mate"?`Mate in ${score[2]}`:`${Number(score[2])>=0?"+":""}${(Number(score[2])/100).toFixed(2)} pawns (engine score)`;$("#engineEvaluation").textContent=`Evaluation: ${label}`;}
    if(depth)setEngineStatus(`Analyzing… depth ${depth[1]}`,"Analyzing");
    if(pv){const san=uciPvToSan(engineCurrentFen,pv[1].split(/\s+/));if(san)$("#enginePv").textContent=`Principal variation: ${san}`;}
    return;
  }
  if(line.startsWith("bestmove ")){
    if(engineAwaitingSearchReady||!engineBusy)return;
    const best=line.split(/\s+/)[1];let bestSan=best;if(engineCurrentFen){const san=uciPvToSan(engineCurrentFen,[best]);bestSan=san||best;$("#engineBestMove").textContent=`Best move: ${bestSan}`;}
    lastEngineResult={fen:engineCurrentFen,depth:engineCurrentDepth,evaluation:$("#engineEvaluation").textContent.replace(/^Evaluation:\s*/,""),bestMove:bestSan,pv:$("#enginePv").textContent.replace(/^Principal variation:\s*/,"")};$("#saveEngineAnalysis").disabled=!lastEngineResult.fen;
    engineBusy=false;pendingEngineAnalysis=null;engineCurrentFen=null;$("#analyzePosition").disabled=false;$("#stopAnalysis").disabled=true;setEngineStatus("Analysis complete.","Ready");
  }
}
function initEngine(){
  if(engineWorker)return;
  if(typeof Worker==="undefined"){setEngineStatus("Web Workers are not supported in this browser.","Unavailable");return;}
  try{
    setEngineStatus("Loading Stockfish.js lite engine from CDN…","Loading");
    engineWorker=new Worker("./engine/stockfish-loader.js");
    engineWorker.onmessage=event=>handleEngineMessage(event.data);
    engineWorker.onerror=error=>{engineReady=false;engineBusy=false;engineWorker=null;pendingEngineAnalysis=null;engineAwaitingSearchReady=false;setEngineStatus("Engine worker failed. This may be a CDN, WASM, or WebView restriction.","Engine error");$("#analyzePosition").disabled=false;$("#stopAnalysis").disabled=true;console.warn("Stockfish worker error",error);};
    sendEngineCommand("uci");
  }catch(error){engineWorker=null;setEngineStatus("Could not create the engine worker in this browser.","Unavailable");console.warn(error);}
}
function runEngineAnalysis(fen,depth){
  if(!engineWorker||!engineReady){pendingEngineAnalysis={fen,depth};initEngine();return;}
  const wasBusy=engineBusy;engineBusy=true;pendingEngineAnalysis={fen,depth};engineCurrentFen=fen;engineCurrentDepth=depth;engineAwaitingSearchReady=true;
  $("#engineEvaluation").textContent="Evaluation: calculating…";$("#engineBestMove").textContent="Best move: calculating…";$("#enginePv").textContent="Principal variation: calculating…";$("#analyzePosition").disabled=true;$("#stopAnalysis").disabled=false;setEngineStatus(`Preparing analysis to depth ${depth}…`,"Analyzing");
  if(wasBusy)sendEngineCommand("stop");sendEngineCommand("ucinewgame");sendEngineCommand("isready");
}
function analyzeCurrentPosition(){
  const depth=Math.max(6,Math.min(20,Number($("#engineDepth").value)||14));
  if(engineReady)runEngineAnalysis(state.chess.fen(),depth);else{pendingEngineAnalysis={fen:state.chess.fen(),depth};initEngine();}
}
function saveEngineAnalysisToNotes(){
  if(!lastEngineResult?.fen){toast("Run an engine analysis first.");return;}
  const result=lastEngineResult,lines=[`Engine analysis (depth ${result.depth})`, `FEN: ${result.fen}`, `Evaluation: ${result.evaluation}`, `Best move: ${result.bestMove}`, `Principal variation: ${result.pv}`].join("\n");
  const line=state.activeVariation,positionPly=state.variationPly;let savedAsPosition=false;
  if(line&&Array.isArray(line.moves)){
    try{const replay=new Chess();for(const san of line.moves.slice(0,positionPly))replay.move(san);if(replay.fen()===result.fen){const key=`${line.id}:${positionPly}`,existing=state.positionNotes[key]||"";state.positionNotes[key]=[existing,lines].filter(Boolean).join("\n\n").slice(0,2000);savedAsPosition=true;}}catch{}
  }
  if(!savedAsPosition){const targetId=line?.id||state.opening?.id;if(!targetId){toast("Select an opening or study line first.");return;}const existing=state.studyNotes[targetId]||"";state.studyNotes[targetId]=[existing,lines].filter(Boolean).join("\n\n").slice(0,3000);}
  localStorage.setItem("coa_position_notes",JSON.stringify(state.positionNotes));localStorage.setItem("coa_study_notes",JSON.stringify(state.studyNotes));save();toast(savedAsPosition?"Engine analysis saved to this position's note.":"Engine analysis saved to the study-line notes.");
}
function stopEngineAnalysis(){
  if(engineWorker&&engineBusy)sendEngineCommand("stop");engineBusy=false;pendingEngineAnalysis=null;engineCurrentFen=null;engineAwaitingSearchReady=false;$("#analyzePosition").disabled=false;$("#stopAnalysis").disabled=true;setEngineStatus(engineReady?"Analysis stopped.":"Engine is not ready.",engineReady?"Ready":"Not loaded");
}

function collectProgressBackup(){
  return {
    format:"chess-opening-academy-backup",version:1,exportedAt:new Date().toISOString(),
    data:{stats:state.stats,repertoire:state.repertoire,repertoireLines:state.repertoireLines,customLines:state.customLines,lineProgress:state.lineProgress,reviewCards:state.reviewCards,studyNotes:state.studyNotes,positionNotes:state.positionNotes,puzzleSolved:state.puzzleSolved,puzzleAttempts:state.puzzleAttempts,puzzleReviews:state.puzzleReviews,mastered:readStored("coa_mastered",[])}
  };
}
function exportProgressBackup(){
  const field=$("#backupInput");if(!field)return;
  field.value=JSON.stringify(collectProgressBackup(),null,2);field.focus();field.select();
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(field.value).then(()=>toast("Backup JSON copied. Save it somewhere safe.")).catch(()=>toast("Backup is in the text box; copy it manually."));
  else toast("Backup is in the text box; copy it manually.");
}
function importProgressBackup(){
  const raw=$("#backupInput")?.value?.trim();if(!raw){toast("Paste a backup JSON first.");return;}
  let backup;try{backup=JSON.parse(raw);}catch{toast("Backup JSON is not valid.");return;}
  if(backup?.format!=="chess-opening-academy-backup"||backup?.version!==1||!backup.data||typeof backup.data!=="object"){toast("Unsupported backup format or version.");return;}
  const d=backup.data;
  const arrayKeys=["repertoire","repertoireLines","customLines","puzzleSolved","mastered"];
  const objectKeys=["stats","lineProgress","reviewCards","studyNotes","positionNotes","puzzleAttempts","puzzleReviews"];
  if(arrayKeys.some(k=>d[k]!==undefined&&!Array.isArray(d[k]))||objectKeys.some(k=>d[k]!==undefined&&(!d[k]||typeof d[k]!=="object"||Array.isArray(d[k])))){toast("Backup structure is invalid; no data was changed.");return;}
  if(!confirm("Restore this backup and replace the current local progress, repertoire, review schedules, and study notes?"))return;
  const keys={stats:"coa_stats",repertoire:"coa_repertoire",repertoireLines:"coa_repertoire_lines",customLines:"coa_custom_lines",lineProgress:"coa_line_progress",reviewCards:"coa_review_cards",studyNotes:"coa_study_notes",positionNotes:"coa_position_notes",puzzleSolved:"coa_puzzle_solved",puzzleAttempts:"coa_puzzle_attempts",puzzleReviews:"coa_puzzle_reviews",mastered:"coa_mastered"};
  for(const [source,key] of Object.entries(keys)){if(d[source]!==undefined)localStorage.setItem(key,JSON.stringify(d[source]));else localStorage.removeItem(key);}
  toast("Backup restored. Reloading your academy.");location.reload();
}

function openingAnalyticsRow(opening){
  const ids=[opening.id,...VARIATIONS.filter(v=>v.openingId===opening.id).map(v=>v.id)];
  const records=ids.map(id=>state.lineProgress[id]).filter(Boolean);
  const attempts=records.reduce((n,r)=>n+(r.attempts||0),0),correct=records.reduce((n,r)=>n+(r.correct||0),0),completed=records.some(r=>r.completed),saved=state.repertoire.includes(opening.id)||state.repertoireLines.some(id=>VARIATIONS.some(v=>v.id===id&&v.openingId===opening.id));
  return {opening,attempts,correct,accuracy:attempts?Math.round(correct/attempts*100):0,completed,saved,practiced:attempts>0};
}
function renderOpeningAnalytics(){
  const table=$("#analyticsTable"),summary=$("#analyticsSummary");if(!table||!summary)return;
  const rows=OPENINGS.map(openingAnalyticsRow),filtered=rows.filter(r=>analyticsFilter==="all"||r.opening.side===analyticsFilter);
  const practiced=rows.filter(r=>r.practiced).length,completed=rows.filter(r=>r.completed).length,totalAttempts=rows.reduce((n,r)=>n+r.attempts,0),totalCorrect=rows.reduce((n,r)=>n+r.correct,0),accuracy=totalAttempts?Math.round(totalCorrect/totalAttempts*100):0;
  $("#analyticsSummaryBadge").textContent=`${practiced}/${rows.length} practiced`;
  summary.innerHTML=`<div class="analytics-stat"><b>${totalAttempts}</b><span>line attempts</span></div><div class="analytics-stat"><b>${accuracy}%</b><span>move accuracy</span></div><div class="analytics-stat"><b>${completed}</b><span>practice goals met</span></div><div class="analytics-stat"><b>${state.repertoire.length+state.repertoireLines.length}</b><span>saved openings/lines</span></div>`;
  const sorted=filtered.sort((a,b)=>Number(b.completed)-Number(a.completed)||b.attempts-a.attempts||a.opening.name.localeCompare(b.opening.name));
  table.innerHTML=sorted.map(r=>`<div class="analytics-row"><div class="analytics-opening"><b>${escapeHtml(r.opening.name)}</b><small>${r.opening.eco} · ${r.opening.side==="other"?"Flank/other":r.opening.side+" family"}</small></div><div class="analytics-metric"><b>${r.attempts}</b><small>attempts</small></div><div class="analytics-metric"><b>${r.attempts?r.accuracy+"%":"—"}</b><small>accuracy</small></div><span class="analytics-status ${r.completed?"complete":r.practiced?"active":"idle"}">${r.completed?"Goal met":r.practiced?"In progress":"Not started"}</span><button class="analytics-open" data-analytics-open="${r.opening.id}">Study</button></div>`).join("")||'<p class="muted">No openings in this filter.</p>';
  table.querySelectorAll("[data-analytics-open]").forEach(b=>b.onclick=()=>{selectOpening(b.dataset.analyticsOpen);$("#openingTitle")?.scrollIntoView({behavior:"smooth",block:"start"});});
}

function openingCoverageRow(opening){
  const lines=VARIATIONS.filter(v=>v.openingId===opening.id),basePlies=Array.isArray(opening.moves)?opening.moves.length:0;
  let longest={name:opening.name,moves:opening.moves||[],id:opening.id};
  for(const line of lines)if(line.moves.length>(longest.moves?.length||0))longest=line;
  return {opening,linesCount:lines.length,basePlies,maxPlies:longest.moves?.length||basePlies,longestName:longest.name||opening.name};
}
function renderCurriculumCoverage(){
  const table=$("#coverageTable"),summary=$("#coverageSummary");if(!table||!summary)return;
  const all=OPENINGS.map(openingCoverageRow),filtered=all.filter(r=>coverageFilter==="all"||r.opening.side===coverageFilter);
  const noBranches=all.filter(r=>r.linesCount===0).length,maxLine=all.reduce((max,r)=>Math.max(max,r.maxPlies),0),totalLines=VARIATIONS.length;
  $("#coverageSummaryBadge").textContent=`${all.length} openings · ${totalLines} lines`;
  summary.innerHTML=`<div class="coverage-stat"><b>${all.length}</b><span>opening entries</span></div><div class="coverage-stat"><b>${totalLines}</b><span>curated variation lines</span></div><div class="coverage-stat"><b>${noBranches}</b><span>without extra variations</span></div><div class="coverage-stat"><b>${maxLine}</b><span>longest stored line · plies</span></div>`;
  const sorted=filtered.sort((a,b)=>a.linesCount-b.linesCount||a.maxPlies-b.maxPlies||a.opening.name.localeCompare(b.opening.name));
  table.innerHTML=sorted.map(r=>`<div class="coverage-row"><div class="coverage-opening"><b>${escapeHtml(r.opening.name)}</b><small>${r.opening.eco} · ${r.opening.side==="other"?"Flank/other":r.opening.side+" family"}</small></div><div class="coverage-metric"><b>${r.linesCount}</b><small>extra lines</small></div><div class="coverage-metric"><b>${r.maxPlies}</b><small>max plies</small></div><div class="coverage-longest"><small>${escapeHtml(r.longestName)}</small></div><button class="coverage-open" data-coverage-open="${r.opening.id}">Study</button></div>`).join("")||'<p class="muted">No openings in this filter.</p>';
  table.querySelectorAll("[data-coverage-open]").forEach(b=>b.onclick=()=>{selectOpening(b.dataset.coverageOpen);$("#openingTitle")?.scrollIntoView({behavior:"smooth",block:"start"});});
}

function buildDataHealthReport(){
  const openingRows=OPENINGS.map(o=>({type:"Opening",id:o.id,name:o.name,check:openingValidation.get(o.id)||validateLine(o.moves),moves:o.moves}));
  const variationRows=VARIATIONS.map(v=>({type:"Variation",id:v.id,name:v.name,check:variationValidation.get(v.id)||validateLine(v.moves),moves:v.moves}));
  const puzzleRows=BOARD_PUZZLES.map(p=>({type:"Puzzle",id:p.id,name:p.title,check:validatePuzzle(p),moves:[p.solution]}));
  const all=[...openingRows,...variationRows,...puzzleRows];
  return {all,openingRows,variationRows,puzzleRows,valid:all.filter(x=>x.check.valid).length,invalid:all.filter(x=>!x.check.valid).length};
}
function renderDataHealth(){
  const summary=$("#dataHealthSummary"),report=$("#dataHealthReport");if(!summary||!report)return;
  const data=buildDataHealthReport();
  const counts=[{label:"Opening sequences",rows:data.openingRows},{label:"Curated variations",rows:data.variationRows},{label:"Board puzzles",rows:data.puzzleRows}];
  summary.innerHTML=counts.map(c=>{const ok=c.rows.filter(x=>x.check.valid).length;return `<div class="data-health-stat"><b>${ok}/${c.rows.length}</b><span>${c.label} legal/valid</span></div>`;}).join("")+`<div class="data-health-stat ${data.invalid?"has-issues":"all-clear"}"><b>${data.invalid}</b><span>Items requiring data review</span></div>`;
  const invalid=data.all.filter(x=>!x.check.valid);
  report.innerHTML=invalid.length?`<div class="data-health-warning">${invalid.length} item(s) failed validation. They should be corrected before being used as study material.</div>`+invalid.map(x=>`<div class="data-health-row"><div><b>${x.type}: ${x.name}</b><small>${x.moves.join(" ")}</small><small class="data-health-error">${x.check.reason||x.check.error||"Validation failed"}</small></div><span class="pill">Review</span></div>`).join(""):`<div class="data-health-clear">All stored opening sequences, curated variations, and configured puzzle solutions passed their configured legality/goal checks.</div>`;
  if(!invalid.length)report.insertAdjacentHTML("beforeend",`<p class="muted">Legal-sequence validation does not determine opening theory quality, best moves, or whether a position is objectively winning.</p>`);
}

function openingHasPractice(openingId){
  if((state.lineProgress[openingId]?.attempts||0)>0)return true;
  return VARIATIONS.some(v=>v.openingId===openingId&&(state.lineProgress[v.id]?.attempts||0)>0);
}
function openingIsComplete(openingId){
  if(state.lineProgress[openingId]?.completed)return true;
  return VARIATIONS.some(v=>v.openingId===openingId&&state.lineProgress[v.id]?.completed);
}
function renderCourseRoadmap(){
  const cards=$("#roadmapCards"),summary=$("#roadmapSummary");if(!cards||!summary)return;
  const progress=COURSE_PATHS.map(path=>{
    if(path.puzzles){const total=BOARD_PUZZLES.length,done=state.puzzleSolved.length;return {...path,total,done,pct:total?Math.round(done/total*100):0,complete:total>0&&done===total};}
    const total=path.openingIds.length,done=path.openingIds.filter(openingIsComplete).length,practiced=path.openingIds.filter(openingHasPractice).length;
    return {...path,total,done,practiced,pct:total?Math.round(done/total*100):0,complete:total>0&&done===total};
  });
  const totalUnits=progress.reduce((n,p)=>n+p.total,0),doneUnits=progress.reduce((n,p)=>n+p.done,0),pct=totalUnits?Math.round(doneUnits/totalUnits*100):0;
  $("#roadmapOverall").textContent=`${pct}% complete`;
  summary.innerHTML=`<div class="roadmap-summary-stat"><b>${doneUnits}/${totalUnits}</b><span>course units completed</span></div><div class="roadmap-summary-stat"><b>${state.puzzleSolved.length}/${BOARD_PUZZLES.length}</b><span>board puzzles solved</span></div><div class="roadmap-summary-stat"><b>${state.repertoireLines.length}</b><span>saved variation lines</span></div>`;
  cards.innerHTML=progress.map((p,i)=>{
    const next=p.puzzles?null:OPENINGS.find(o=>p.openingIds.includes(o.id)&&!openingIsComplete(o.id))||OPENINGS.find(o=>p.openingIds.includes(o.id));
    const status=p.complete?"Stage complete":p.done?`${p.done}/${p.total} completed`:`${p.puzzles?p.done:p.practiced} of ${p.total} ${p.puzzles?"puzzles solved":"openings practiced"}`;
    return `<article class="roadmap-card ${p.complete?"complete":""}"><div class="roadmap-card-top"><span class="roadmap-step">${String(i+1).padStart(2,"0")}</span><span class="pill">${p.level}</span></div><h3>${p.title}</h3><p>${p.description}</p><div class="roadmap-track"><span style="width:${p.pct}%"></span></div><div class="roadmap-status"><span>${status}</span><b>${p.pct}%</b></div><button class="${p.puzzles?"accent-btn":"primary-btn"} roadmap-start" data-roadmap="${p.id}">${p.puzzles?"Open puzzle lab":p.complete?"Review this stage":"Study next opening"}</button></article>`;
  }).join("");
  cards.querySelectorAll("[data-roadmap]").forEach(b=>b.onclick=()=>{
    const path=COURSE_PATHS.find(p=>p.id===b.dataset.roadmap);if(!path)return;
    if(path.puzzles){$("#puzzleHeading")?.scrollIntoView({behavior:"smooth",block:"start"});return;}
    const id=path.openingIds.find(openingId=>!openingIsComplete(openingId))||path.openingIds[0];
    selectOpening(id);$("#openingTitle")?.scrollIntoView({behavior:"smooth",block:"start"});
  });
}

function renderList(){
  const q=$("#searchInput").value.toLowerCase();
  const arr=OPENINGS.filter(o=>(state.filter==="all"||o.side===state.filter||state.filter==="other"&&o.side==="other") &&
    `${o.name} ${o.eco} ${o.desc}`.toLowerCase().includes(q));
  $("#openingCount").textContent=arr.length;
  $("#openingList").innerHTML=arr.map(o=>`<div class="opening-item ${state.opening?.id===o.id?"active":""}" data-id="${o.id}"><b>${o.name}</b><span>${o.eco} · ${o.moves.join(" ")}</span></div>`).join("");
  document.querySelectorAll(".opening-item").forEach(x=>x.onclick=()=>selectOpening(x.dataset.id));
}
function selectOpening(id){
  state.opening=OPENINGS.find(o=>o.id===id); if(!state.opening)return; state.lesson=0; state.chess=new Chess(); state.selected=null; state.redo=[];state.lastMove=null;
  state.activeVariation=VARIATIONS.find(v=>v.openingId===id)||null; state.variationPly=0;
  renderAll(); renderVariationLab(); loadExplorer();
}
function applyMoves(moves){
  const next=new Chess();
  for(const san of moves){
    try{ next.move(san); }
    catch(e){ console.warn("Invalid move sequence",san,e); break; }
  }
  state.chess=next; state.selected=null;
  const history=next.history({verbose:true}),last=history[history.length-1];state.lastMove=last?{from:last.from,to:last.to}:null;
}
function squareToXY(s){return {f:s.charCodeAt(0)-97,r:Number(s[1])-1}}
function xyToSquare(f,r){return String.fromCharCode(97+f)+(r+1)}
function renderBoard(target="#board"){
  const el=$(target); if(!el)return;
  el.innerHTML="";
  const displayRows=[0,1,2,3,4,5,6,7], displayFiles=[0,1,2,3,4,5,6,7];
  const rows=state.flipped?[...displayRows].reverse():displayRows;
  const files=state.flipped?[...displayFiles].reverse():displayFiles;
  const board=state.chess.board();
  const isInteractive=target==="#board";
  const legal=state.selected?state.chess.moves({square:state.selected,verbose:true}).map(m=>m.to):[];
  rows.forEach((boardRow,displayRow)=>files.forEach((f,displayCol)=>{
    const boardFile=f;
    const rankIndex=boardRow;
    const fileIndex=f;
    const rank=8-rankIndex;
    const file=String.fromCharCode(97+fileIndex);
    const sq=file+rank;
    const p=board[rankIndex][fileIndex], d=document.createElement("div");
    d.className=`sq ${(displayRow+displayCol)%2?"dark":"light"} ${sq===state.selected?"selected":""} ${legal.includes(sq)?"legal":""} ${isInteractive&&state.lastMove&&(sq===state.lastMove.from||sq===state.lastMove.to)?"last-move":""}`;
    if(isInteractive){d.setAttribute("role","button");d.setAttribute("tabindex","0");d.dataset.square=sq;
      d.setAttribute("aria-label",`${sq}${p?`, ${p.color==="w"?"White":"Black"} ${({p:"pawn",n:"knight",b:"bishop",r:"rook",q:"queen",k:"king"})[p.type]}`:" empty"}${legal.includes(sq)?", legal destination":""}${sq===state.selected?", selected":""}`); }
    if(legal.includes(sq)&&p)d.classList.add("capture");
    if(p)d.innerHTML=pieceMarkup(p,`piece-art${isInteractive&&state.lastMove?.to===sq?" piece-arrive":""}`);
    if(displayCol===0||displayRow===7)d.insertAdjacentHTML("beforeend",`<span class="coords" aria-hidden="true">${displayCol===0?rank:""}${displayRow===7?file:""}</span>`);
    if(isInteractive)d.onclick=()=>{state.keyboardFocusSquare=sq;clickSquare(sq);};
    if(isInteractive)d.onkeydown=e=>{
      if(e.key==="Enter"||e.key===" "){e.preventDefault();state.keyboardFocusSquare=sq;state.restoreBoardFocus=true;clickSquare(sq);return;}
      const currentFile=sq.charCodeAt(0)-97,currentRank=Number(sq[1]);let nextFile=currentFile,nextRank=currentRank;
      if(e.key==="ArrowLeft")nextFile+=state.flipped?1:-1;
      else if(e.key==="ArrowRight")nextFile+=state.flipped?-1:1;
      else if(e.key==="ArrowUp")nextRank+=state.flipped?-1:1;
      else if(e.key==="ArrowDown")nextRank+=state.flipped?1:-1;
      else return;
      e.preventDefault();if(nextFile<0||nextFile>7||nextRank<1||nextRank>8)return;
      state.keyboardFocusSquare=String.fromCharCode(97+nextFile)+nextRank;$("${target} [data-square=\"${state.keyboardFocusSquare}\"]")?.focus();
    };
    if(isInteractive){
      d.ondragover=e=>{e.preventDefault();};
      d.ondrop=e=>{e.preventDefault();const from=e.dataTransfer?.getData("text/plain");if(from&&from!==sq){state.selected=from;attemptMove(from,sq);}};
      d.ondragstart=e=>{const pieceAt=state.chess.get(sq);if(!pieceAt||pieceAt.color!==state.chess.turn()){e.preventDefault();return;}state.selected=sq;state.keyboardFocusSquare=sq;e.dataTransfer?.setData("text/plain",sq);if(e.dataTransfer)e.dataTransfer.effectAllowed="move";};
    }
    el.appendChild(d);
  }));
  if(state.restoreBoardFocus&&state.keyboardFocusSquare){el.querySelector(`[data-square="${state.keyboardFocusSquare}"]`)?.focus();state.restoreBoardFocus=false;}
}
function performMove(from,to,promotion="q"){
  try{const move=state.chess.move({from,to,promotion});state.lastMove={from:move.from,to:move.to};state.redo=[];state.selected=null;state.pendingPromotion=null;renderAll();loadExplorer();return true;}
  catch{return false;}
}
function attemptMove(from,to){
  const moving=state.chess.get(from);
  if(moving?.type==="p"&&(to[1]==="8"||to[1]==="1")){
    state.pendingPromotion={from,to};$("#promotionDialog").showModal();return true;
  }
  return performMove(from,to,"q");
}
function completePromotion(pieceType){
  const pending=state.pendingPromotion;if(!pending)return;
  $("#promotionDialog").close();
  if(!performMove(pending.from,pending.to,pieceType)){state.pendingPromotion=null;toast("Promotion move could not be applied.");}
}
function clickSquare(sq){
  const piece=state.chess.get(sq);
  if(state.selected){
    if(piece&&piece.color===state.chess.turn()){state.selected=sq;state.keyboardFocusSquare=sq;renderBoard();return;}
    const from=state.selected;state.keyboardFocusSquare=sq;
    if(attemptMove(from,sq))return;
    state.selected=null;renderBoard();return;
  }
  if(piece&&piece.color===state.chess.turn()){state.selected=sq;state.keyboardFocusSquare=sq;renderBoard();}
}
function renderMoves(){
  const hist=state.chess.history({verbose:true}), rows=[];
  for(let i=0;i<hist.length;i+=2){
    rows.push(`<div class="move-row">
      <span>${i/2+1}.</span><button data-ply="${i+1}">${hist[i]?.san||""}</button><button data-ply="${i+2}" ${hist[i+1]?"":"disabled"}>${hist[i+1]?.san||""}</button></div>`);
  }
  $("#moveList").innerHTML=rows.join("")||`<div class="muted">No moves yet.</div>`;
  $("#moveList").querySelectorAll("button[data-ply]").forEach(b=>b.onclick=()=>{
    const ply=Number(b.dataset.ply); const full=state.chess.history();
    if(ply<1||ply>full.length)return;
    applyMoves(full.slice(0,ply)); state.redo=[]; state.selected=null; renderAll(); loadExplorer();
  });
}
function allStudyLines(){return [...VARIATIONS,...state.customLines];}
function positionKeysForLine(moves){
  try{
    const game=new Chess(),keys=[game.fen().split(" ").slice(0,4).join(" ")];
    for(const san of moves){game.move(san);keys.push(game.fen().split(" ").slice(0,4).join(" "));}
    return keys;
  }catch{return null;}
}
function findTranspositions(currentLine,currentPly){
  if(!currentLine||currentPly<1)return [];
  const currentKeys=positionKeysForLine(currentLine.moves),currentKey=currentKeys?.[currentPly];if(!currentKey)return [];
  const currentPrefix=currentLine.moves.slice(0,currentPly),matches=[];
  for(const line of allStudyLines()){
    if(line.id===currentLine.id)continue;
    const keys=positionKeysForLine(line.moves);if(!keys)continue;
    for(let ply=1;ply<keys.length;ply++){
      if(keys[ply]!==currentKey)continue;
      const otherPrefix=line.moves.slice(0,ply);
      if(otherPrefix.join(" ")===currentPrefix.join(" "))continue;
      matches.push({line,ply});break;
    }
  }
  return matches.slice(0,8);
}
function loadStudyLineAtPly(line,ply){
  if(!line||!validateLine(line.moves).valid)return;
  state.activeVariation=line;state.variationPly=Math.max(0,Math.min(ply,line.moves.length));
  if(line.isCustom){state.opening={id:"custom-study",name:line.name,eco:"CUSTOM PGN",side:"other",desc:"Your imported personal study line. Review the sequence and add your own notes.",moves:line.moves,why:[line.idea||"Review the position and candidate moves."]};}
  else state.opening=OPENINGS.find(o=>o.id===line.openingId)||state.opening;
  applyMoves(line.moves.slice(0,state.variationPly));state.redo=[];renderAll();renderVariationLab();loadExplorer();
}

function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function saveStudyNote(){
  const v=state.activeVariation;if(!v)return;
  const field=$("#variationPersonalNote");if(!field)return;
  const note=field.value.slice(0,3000).trim();
  if(note)state.studyNotes[v.id]=note;else delete state.studyNotes[v.id];
  localStorage.setItem("coa_study_notes",JSON.stringify(state.studyNotes));
  toast(note?"Study note saved for this variation.":"Study note cleared.");renderVariationLab();renderCourseRoadmap();
}
function copyStudyNote(){
  const v=state.activeVariation;if(!v)return;const note=state.studyNotes[v.id]||"";if(!note){toast("No saved note for this variation.");return;}
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(note).then(()=>toast("Study note copied.")).catch(()=>toast("Clipboard access unavailable; your note remains saved."));else toast("Clipboard access unavailable; your note remains saved.");
}
function savePositionNote(){
  const v=state.activeVariation;if(!v)return;const field=$("#positionPersonalNote");if(!field)return;
  const key=`${v.id}:${state.variationPly}`,note=field.value.slice(0,2000).trim();
  if(note)state.positionNotes[key]=note;else delete state.positionNotes[key];
  localStorage.setItem("coa_position_notes",JSON.stringify(state.positionNotes));toast(note?"Position note saved.":"Position note cleared.");renderVariationLab();
}
function clearPositionNote(){
  const v=state.activeVariation;if(!v)return;delete state.positionNotes[`${v.id}:${state.variationPly}`];localStorage.setItem("coa_position_notes",JSON.stringify(state.positionNotes));toast("Position note cleared.");renderVariationLab();
}
function renderVariationLab(){
  const list=$("#variationList"), details=$("#variationDetails");
  if(!list||!details)return;
  const items=VARIATIONS.filter(v=>!state.opening||v.openingId===state.opening.id);
  const validCount=items.filter(v=>(variationValidation.get(v.id)||validateLine(v.moves)).valid).length;
  $("#variationCount").textContent=`${validCount}/${items.length} legal lines`;
  list.innerHTML=items.length?items.map(v=>{
    const pr=state.lineProgress[v.id]||{attempts:0,correct:0,completed:false};
    const check=variationValidation.get(v.id)||validateLine(v.moves);
    const pct=pr.attempts?Math.round(pr.correct/pr.attempts*100):0;
    const status=check.valid?(pr.completed?"Practice goal met":pr.attempts?`${pct}% practice accuracy`:`Not practiced`):"Move data needs review";
    return `<button class="variation-item ${state.activeVariation?.id===v.id?"active":""}" data-variation="${v.id}"><span><b>${v.name}</b><small>${v.kind.toUpperCase()} · ${Math.ceil(v.moves.length/2)} move pairs · ${check.valid?"Legal sequence":"⚠ Check sequence"} · ${status}</small></span><span>›</span></button>`;
  }).join(""):`<div class="muted">No curated line yet for this opening.</div>`;
  list.querySelectorAll("[data-variation]").forEach(b=>b.onclick=()=>{state.activeVariation=VARIATIONS.find(v=>v.id===b.dataset.variation)||null;state.variationPly=0;renderVariationLab();});
  const v=state.activeVariation;
  if(!v){details.innerHTML=`<p class="muted">Choose a variation to see plans and common mistakes.</p>`;return;}
  state.variationPly=Math.max(0,Math.min(state.variationPly||0,v.moves.length));
  const pr=state.lineProgress[v.id]||{attempts:0,correct:0,completed:false};
  const prefix=v.moves.slice(0,state.variationPly);
  const branches=allStudyLines().filter(other=>other.id!==v.id&&other.moves.length>prefix.length && prefix.every((m,i)=>other.moves[i]===m));
  const transpositions=findTranspositions(v,state.variationPly);
  const nextMoves=[...new Set(branches.map(other=>other.moves[prefix.length]))];
  const moveButtons=v.moves.map((san,i)=>`<button class="line-move ${i===state.variationPly-1?"current":""}" data-ply="${i+1}" title="Show position after ${san}">${i%2===0?`${Math.floor(i/2)+1}. `:""}${san}</button>`).join(" ");
  const positionNoteKey=`${v.id}:${state.variationPly}`,positionNote=state.positionNotes[positionNoteKey]||"";
  const branchHtml=nextMoves.length?nextMoves.map(san=>`<button class="branch-move" data-branch-san="${san}">${san}</button>`).join(""):`<span class="muted">No further shared branch from this position yet.</span>`;
  const transpositionHtml=transpositions.length?transpositions.map(t=>`<button class="transposition-item" data-transposition-id="${t.line.id}" data-transposition-ply="${t.ply}"><span><b>${escapeHtml(t.line.name)}</b><small>Same position after ${t.ply} plies · ${t.line.isCustom?"Custom line":"Curated line"}</small></span><span>Open ↗</span></button>`).join(""):`<p class="muted">No alternate move-order matches found at this position in the saved study lines.</p>`;
  details.innerHTML=`<div class="variation-meta"><span class="pill">${v.kind.toUpperCase()} LINE</span><span>${Math.ceil(v.moves.length/2)} move pairs · ${pr.attempts} attempts · ${pr.correct} correct</span></div>
    <p class="variation-idea">${v.idea}</p>
    <div class="plan-columns"><div><h4>Plans</h4><ul>${v.plans.map(x=>`<li>${x}</li>`).join("")}</ul></div><div><h4>Common mistakes</h4><ul>${v.mistakes.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>
    <div class="endgame-note"><b>Endgame / transition note</b><p>${v.endgame}</p></div>
    <div class="line-notation"><b>Study line — tap any move to jump to that position</b><p>${moveButtons||"No moves available."}</p></div>
    <div class="branch-explorer"><b>Continue from ply ${state.variationPly}</b><p class="muted">Moves shared by study lines from this exact move prefix:</p><div class="branch-moves">${branchHtml}</div></div>
    <div class="transposition-explorer"><b>Transposition matches</b><p class="muted">Other saved lines that reach the same position through a different move order. Position matching includes side to move, castling rights and en-passant square.</p><div class="transposition-list">${transpositionHtml}</div></div>
    <div class="progress-track"><span style="width:${pr.attempts?Math.round(pr.correct/pr.attempts*100):0}%"></span></div><small class="muted">Practice progress: ${pr.completed?"Practice goal met (80%+ accuracy after at least 5 attempts)":pr.attempts?`${Math.round(pr.correct/pr.attempts*100)}% accuracy`:"Not started"}</small>
    <div class="position-note"><div class="personal-note-heading"><b>Note for this exact position</b><span class="muted">Ply ${state.variationPly} · up to 2,000 characters</span></div><textarea id="positionPersonalNote" maxlength="2000" rows="3" placeholder="What candidate moves matter here? What changes if the opponent deviates?">${escapeHtml(positionNote)}</textarea><div class="personal-note-actions"><button id="savePositionNote" class="primary-btn">Save position note</button><button id="clearPositionNote" class="ghost-btn">Clear position note</button></div></div>
    <div class="personal-note"><div class="personal-note-heading"><b>My study notes for this line</b><span class="muted">Saved on this device · up to 3,000 characters</span></div><textarea id="variationPersonalNote" maxlength="3000" rows="4" placeholder="Record your overall plans, opponent ideas, mistakes to avoid, or questions about this line…">${escapeHtml(state.studyNotes[v.id]||"")}</textarea><div class="personal-note-actions"><button id="saveVariationNote" class="primary-btn">Save note</button><button id="copyVariationNote" class="ghost-btn">Copy note</button><button id="clearVariationNote" class="ghost-btn">Clear</button></div></div>`;
  details.querySelectorAll("[data-ply]").forEach(b=>b.onclick=()=>{state.variationPly=Number(b.dataset.ply);applyMoves(v.moves.slice(0,state.variationPly));state.redo=[];renderAll();renderVariationLab();loadExplorer();});
  details.querySelectorAll("[data-branch-san]").forEach(b=>b.onclick=()=>{
    const next=nextMoves.find(x=>x===b.dataset.branchSan); if(!next)return;
    const candidate=branches.find(other=>other.moves[prefix.length]===next); if(!candidate)return;
    loadStudyLineAtPly(candidate,prefix.length+1);
  });
  details.querySelectorAll("[data-transposition-id]").forEach(b=>b.onclick=()=>{const line=allStudyLines().find(x=>x.id===b.dataset.transpositionId);if(line)loadStudyLineAtPly(line,Number(b.dataset.transpositionPly));});
  $("#savePositionNote")?.addEventListener("click",savePositionNote);
  $("#clearPositionNote")?.addEventListener("click",clearPositionNote);
  $("#saveVariationNote")?.addEventListener("click",saveStudyNote);
  $("#copyVariationNote")?.addEventListener("click",copyStudyNote);
  $("#clearVariationNote")?.addEventListener("click",()=>{if(!state.activeVariation)return;delete state.studyNotes[state.activeVariation.id];localStorage.setItem("coa_study_notes",JSON.stringify(state.studyNotes));toast("Study note cleared.");renderVariationLab();});
}
function formatLine(moves){
  const out=[]; for(let i=0;i<moves.length;i+=2)out.push(`${Math.floor(i/2)+1}. ${moves[i]}${moves[i+1]?` ${moves[i+1]}`:""}`); return out.join(" ");
}
function loadActiveVariation(){
  const v=state.activeVariation;if(!v){toast("Choose a variation first.");return;}
  const check=variationValidation.get(v.id)||validateLine(v.moves);if(!check.valid){toast("This line contains invalid move data and needs review.");return;}
  try{state.variationPly=v.moves.length;applyMoves(v.moves);state.redo=[];state.selected=null;renderAll();loadExplorer();toast("Study line loaded.");}
  catch(e){console.error(e);toast("This line could not be loaded. Verify the move data.");}
}

function renderPatternTrainer(){
  const list=$("#patternList"), card=$("#patternCard"); if(!list||!card)return;
  const items=STUDY_PATTERNS.filter(p=>state.patternFilter==="all"||p.category===state.patternFilter);
  if(!state.activePattern||!items.some(p=>p.id===state.activePattern.id)){state.activePattern=items[0]||null;state.patternAnswerVisible=false;}
  list.innerHTML=items.map(p=>`<button class="pattern-item ${state.activePattern?.id===p.id?"active":""}" data-pattern="${p.id}"><b>${p.name}</b><small>${p.level} · ${p.category==="mate"?"Mating pattern":p.category==="attack"?"Tactical idea":"Endgame"}</small></button>`).join("");
  list.querySelectorAll("[data-pattern]").forEach(b=>b.onclick=()=>{state.activePattern=STUDY_PATTERNS.find(p=>p.id===b.dataset.pattern)||null;state.patternAnswerVisible=false;renderPatternTrainer();});
  const p=state.activePattern;
  if(!p){card.innerHTML=`<p class="muted">No concepts in this category.</p>`;return;}
  card.innerHTML=`<div class="pattern-card-top"><span class="pill">${p.level.toUpperCase()}</span><span class="muted">${p.category.toUpperCase()}</span></div><h3>${p.name}</h3><p>${p.idea}</p><div class="pattern-callout"><b>What to look for</b><p>${p.spot}</p></div><div class="pattern-question"><b>Quick check</b><p>${p.question}</p></div>${state.patternAnswerVisible?`<div class="pattern-answer"><b>Answer</b><p>${p.answer}</p></div>`:`<div class="muted answer-hidden">Answer hidden — think it through before revealing.</div>`}`;
  $("#revealPattern").textContent=state.patternAnswerVisible?"Answer revealed":"Reveal answer";
}
function nextPattern(){
  const items=STUDY_PATTERNS.filter(p=>state.patternFilter==="all"||p.category===state.patternFilter);if(!items.length)return;
  const index=items.findIndex(p=>p.id===state.activePattern?.id);state.activePattern=items[(index+1+items.length)%items.length];state.patternAnswerVisible=false;renderPatternTrainer();
}

function renderLesson(){
  const o=state.opening;
  if(!o){$("#openingTitle").textContent="Select an opening";return}
  $("#openingECO").textContent=o.eco; $("#openingTitle").textContent=o.name; $("#openingDesc").textContent=o.desc;
  $("#lessonTag").textContent=state.mode.toUpperCase();
  $("#lessonProgress").textContent=`${Math.min(state.lesson+1,o.why.length)} / ${o.why.length}`;
  $("#lessonTitle").textContent=state.lesson===0?"Core idea":`Key idea ${state.lesson+1}`;
  $("#lessonText").textContent=o.why[state.lesson]||o.why[0];
}
function renderAll(){ renderList(); renderBoard(); renderMoves(); renderLesson(); renderStats(); renderQueue(); $("#fenInput").value=state.chess.fen(); $("#positionStatus").textContent=state.chess.isCheckmate()?"Checkmate":state.chess.isCheck()?"Check":state.chess.turn()==="w"?"White to move":"Black to move"; }
async function loadExplorer(){
  const token=++state.explorerToken; const box=$("#explorerMoves"), status=$("#explorerStatus");
  status.textContent="Loading Masters data…"; box.innerHTML="";
  try{
    const url="https://explorer.lichess.ovh/masters?"+new URLSearchParams({fen:state.chess.fen(),moves:"12",topGames:"0",recentGames:"0"});
    const res=await fetch(url); if(!res.ok)throw Error("HTTP "+res.status);
    const data=await res.json(); if(token!==state.explorerToken)return;
    status.textContent=`Master games: ${(data.white+data.draws+data.black).toLocaleString()}`;
    const moves=(data.moves||[]).slice(0,8);
    box.innerHTML=moves.length?moves.map(m=>`<div class="explorer-move" data-san="${m.san}"><b>${m.san}</b><span>${m.white}W · ${m.draws}D · ${m.black}B</span></div>`).join(""):`<div class="muted">No master data for this position.</div>`;
    box.querySelectorAll(".explorer-move").forEach(x=>x.onclick=()=>{try{state.chess.move(x.dataset.san);renderAll();loadExplorer()}catch{}});
  }catch(e){status.textContent="Explorer unavailable/offline.";box.innerHTML=`<div class="muted">The board still works locally. Connect online to query Masters data.</div>`}
}
function openTrain(){
  if(!state.opening){toast("Select an opening first.");return;}
  const allDueCards=Object.entries(state.reviewCards).filter(([,card])=>{
    if(card.dueAt>Date.now())return false;
    const v=card.variationId?[...VARIATIONS,...state.customLines].find(x=>x.id===card.variationId):null;
    let o=OPENINGS.find(x=>x.id===card.openingId)||OPENINGS.find(x=>x.id===v?.openingId);
    if(!o&&v?.isCustom)o={id:"custom-study",name:v.name,eco:"CUSTOM PGN",side:"other",desc:v.idea||"Personal study line",moves:v.moves,why:[v.idea||"Review this line."]};
    return validateLine(v?.moves||o?.moves||[]).valid;
  }).sort((a,b)=>a[1].dueAt-b[1].dueAt);
  const dueCards=state.activeVariation?.isCustom?allDueCards.filter(([,card])=>card.variationId===state.activeVariation.id):allDueCards;
  let opening=state.opening, variation=state.activeVariation, line=variation?.moves||opening.moves, targetIndex;
  if(dueCards.length){
    const [reviewKey,card]=dueCards[0];
    const candidateVariation=card.variationId?[...VARIATIONS,...state.customLines].find(v=>v.id===card.variationId):null;
    let candidateOpening=OPENINGS.find(o=>o.id===card.openingId)||OPENINGS.find(o=>o.id===candidateVariation?.openingId);
    if(!candidateOpening&&candidateVariation?.isCustom)candidateOpening={id:"custom-study",name:candidateVariation.name,eco:"CUSTOM PGN",side:"other",desc:candidateVariation.idea||"Personal study line",moves:candidateVariation.moves,why:[candidateVariation.idea||"Review this line."]};
    if(candidateOpening){opening=candidateOpening;variation=candidateVariation;line=variation?.moves||opening.moves;targetIndex=Math.min(card.ply,line.length-1);}
  }
  if(!validateLine(line).valid){toast("This line contains invalid move data and cannot be trained yet.");return;}
  if(targetIndex===undefined)targetIndex=Math.floor(Math.random()*line.length);
  const expected=line[targetIndex];
  const base=new Chess();
  try{
    for(const san of line.slice(0,targetIndex))base.move(san);
    const legal=base.moves();
    if(!legal.includes(expected))throw new Error(`Expected move ${expected} is not legal in training position`);
    const distractors=legal.filter(x=>x!==expected).sort(()=>Math.random()-.5).slice(0,3);
    const choices=[expected,...distractors].sort(()=>Math.random()-.5);
    state.opening=opening;state.activeVariation=variation;state.variationPly=targetIndex;
    state._training={base,expected,openingId:opening.id,ply:targetIndex,variationId:variation?.id||null,explanation:variation?.idea||opening.desc};
    renderAll();renderVariationLab();renderTrainBoard(base);
    const reviewMode=dueCards.length>0;
    $("#trainPrompt").textContent=`${reviewMode?"Due review":"Practice"}: ${variation?.name||opening.name}. Side to move: ${base.turn()==="w"?"White":"Black"}.`;
    $("#trainFeedback").textContent=reviewMode?"This position is due for review.":"Choose a move to see the explanation.";
    $("#trainChoices").innerHTML=choices.map(c=>`<button class="choice" data-move="${c}">${c}</button>`).join("");
    $("#trainChoices").querySelectorAll("button").forEach(b=>b.onclick=()=>answerTrain(b.dataset.move));
    $("#trainDialog").showModal();
  }catch(e){console.error(e);toast("This opening line needs data verification before training.");}
}
function renderTrainBoard(chess){
  const old=state.chess; state.chess=chess; renderBoard("#trainBoard"); state.chess=old;
}
function answerTrain(move){
  const t=state._training; if(!t)return;
  state.stats.attempts++;
  const correct=move===t.expected;
  const reviewKey=`${t.variationId||t.openingId}:${t.ply}`;
  const card=state.reviewCards[reviewKey]||(state.reviewCards[reviewKey]={openingId:t.openingId,variationId:t.variationId,ply:t.ply,repetitions:0,intervalDays:0,dueAt:Date.now()});
  if(correct){
    card.repetitions=(card.repetitions||0)+1;
    card.intervalDays=[1,3,7,14,30][Math.min(card.repetitions-1,4)];
    card.dueAt=Date.now()+card.intervalDays*24*60*60*1000;
  }else{
    card.repetitions=0;card.intervalDays=0;card.dueAt=Date.now()+10*60*1000;
  }
  const progressKey=t.variationId||t.openingId;
  const lineProgress=state.lineProgress[progressKey]||(state.lineProgress[progressKey]={attempts:0,correct:0,completed:false});
  lineProgress.attempts++; if(correct)lineProgress.correct++;
  if(lineProgress.attempts>=5 && lineProgress.correct/lineProgress.attempts>=0.8)lineProgress.completed=true;
  if(correct){
    state.stats.correct++; state.stats.streak++;
    const key=`${t.variationId||t.openingId}:${t.ply}`;
    const mastered=readStored("coa_mastered",[]);
    if(!mastered.includes(key)){mastered.push(key);localStorage.setItem("coa_mastered",JSON.stringify(mastered));state.stats.mastered=mastered.length;}
    $("#trainFeedback").textContent=`Correct. ${t.explanation||state.opening?.why?.[Math.min(t.ply,state.opening.why.length-1)]||"This move follows the study line."}`;
    toast("Correct — opening idea recognized.");
  }else{
    state.stats.streak=0;
    $("#trainFeedback").textContent=`The study line continues with ${t.expected}. ${t.explanation||state.opening?.why?.[Math.min(t.ply,state.opening.why.length-1)]||"Review the move and try again."}`;
    toast(`Not this time. Key move: ${t.expected}`);
  }
  save();
  const buttons=$("#trainChoices").querySelectorAll("button");
  buttons.forEach(b=>{b.disabled=true;if(b.dataset.move===t.expected)b.classList.add("correct-choice");else if(b.dataset.move===move)b.classList.add("wrong-choice");});
  const close=$("#closeTrain"); close.textContent="Done";
}
function rehearsalSource(){
  const v=state.activeVariation;
  const moves=v?.moves||state.opening?.moves||[];
  return {id:v?.id||state.opening?.id||"unknown",name:v?.name||state.opening?.name||"Opening line",moves,explanation:v?.idea||state.opening?.desc||"Follow the move order and understand the plan."};
}
function openLineRehearsal(){
  const source=rehearsalSource();
  if(!source.moves.length||!validateLine(source.moves).valid){toast("This line must pass move validation before rehearsal.");return;}
  state._rehearsal={...source,game:new Chess(),ply:0,side:$("#rehearsalSide").value||"w",finished:false,errors:0};
  $("#lineRehearsalDialog").showModal();advanceRehearsal();
}
function renderRehearsalBoard(){
  const el=$("#lineRehearsalBoard"),r=state._rehearsal;if(!el||!r)return;
  const board=r.game.board();el.innerHTML="";
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const piece=board[row][col],sq=document.createElement("div");sq.className=`rehearsal-square ${(row+col)%2?"dark":"light"}`;
    if(piece)sq.innerHTML=pieceMarkup(piece,"rehearsal-piece-art");
    el.appendChild(sq);
  }
}
function advanceRehearsal(){
  const r=state._rehearsal;if(!r)return;
  try{
    while(r.ply<r.moves.length&&r.game.turn()!==r.side){r.game.move(r.moves[r.ply]);r.ply++;}
  }catch(e){console.warn("Rehearsal line validation failed",e);r.finished=true;$("#rehearsalFeedback").textContent="This line failed during replay and needs review.";$("#rehearsalChoices").innerHTML="";renderRehearsalBoard();return;}
  renderRehearsalBoard();$("#rehearsalProgress").textContent=`${r.ply} / ${r.moves.length} plies`;
  if(r.ply>=r.moves.length){
    r.finished=true;$("#rehearsalPrompt").textContent="Line complete.";$("#rehearsalFeedback").textContent=`You completed ${r.name} with ${r.errors} incorrect attempt(s). Review the line's plans and common mistakes in Variation Lab.`;$("#rehearsalChoices").innerHTML='<p class="muted">Rehearsal complete.</p>';
    const pr=state.lineProgress[r.id]||(state.lineProgress[r.id]={attempts:0,correct:0,completed:false});pr.attempts++;if(r.errors===0)pr.correct++;if(pr.attempts>=3&&pr.correct/pr.attempts>=0.8)pr.completed=true;save();return;
  }
  const expected=r.moves[r.ply],legal=r.game.moves();
  if(!legal.includes(expected)){r.finished=true;$("#rehearsalFeedback").textContent=`Expected move ${expected} is not legal in this position. The line is blocked pending data review.`;$("#rehearsalChoices").innerHTML="";return;}
  const distractors=legal.filter(m=>m!==expected).sort(()=>Math.random()-.5).slice(0,3);
  const choices=[expected,...distractors].sort(()=>Math.random()-.5);
  const moveNo=Math.floor(r.ply/2)+1;
  $("#rehearsalPrompt").textContent=`Play as ${r.side==="w"?"White":"Black"} · Move ${moveNo}${r.game.turn()==="w"?" (White)":" (Black)"}. Choose the study continuation.`;
  $("#rehearsalFeedback").textContent="Choose the move that continues the selected line. Opponent moves from the line are played automatically.";
  $("#rehearsalChoices").innerHTML=choices.map(m=>`<button class="choice" data-rehearsal-move="${m}">${m}</button>`).join("");
  $("#rehearsalChoices").querySelectorAll("button").forEach(b=>b.onclick=()=>answerRehearsal(b.dataset.rehearsalMove));
}
function answerRehearsal(move){
  const r=state._rehearsal;if(!r||r.finished)return;
  const expected=r.moves[r.ply];
  if(move!==expected){r.errors++;$("#rehearsalFeedback").textContent=`Not the study move. The expected continuation is still available; try again. Hint: ${r.explanation}`;return;}
  try{r.game.move(expected);r.ply++;advanceRehearsal();}
  catch(e){r.finished=true;$("#rehearsalFeedback").textContent="Move replay failed; this line needs data review.";}
}
function restartLineRehearsal(){const r=state._rehearsal;if(!r)return;const source=rehearsalSource();state._rehearsal={...source,game:new Chess(),ply:0,side:$("#rehearsalSide").value||r.side,finished:false,errors:0};advanceRehearsal();}

function puzzleList(){
  const categoryItems=BOARD_PUZZLES.filter(p=>state.puzzleFilter==="all"||p.category===state.puzzleFilter);
  return state.puzzleReviewMode?categoryItems.filter(p=>state.puzzleReviews[p.id]&&(state.puzzleReviews[p.id].dueAt||0)<=Date.now()):categoryItems;
}
function puzzleDueCount(){return BOARD_PUZZLES.filter(p=>state.puzzleReviews[p.id]&&(state.puzzleReviews[p.id].dueAt||0)<=Date.now()).length;}
function schedulePuzzleReview(p,correct){
  const card=state.puzzleReviews[p.id]||(state.puzzleReviews[p.id]={repetitions:0,intervalDays:0,dueAt:Date.now()});
  if(correct){card.repetitions=(card.repetitions||0)+1;card.intervalDays=[1,3,7,14,30][Math.min(card.repetitions-1,4)];card.dueAt=Date.now()+card.intervalDays*86400000;card.lastResult="correct";}
  else{card.repetitions=0;card.intervalDays=0;card.dueAt=Date.now()+10*60*1000;card.lastResult="incorrect";}
  localStorage.setItem("coa_puzzle_reviews",JSON.stringify(state.puzzleReviews));
}
function validatePuzzle(p){
  try{
    const game=new Chess(p.fen);
    const move=game.move(p.solution);
    if(!move) return {valid:false,reason:"No solution move"};
    if(p.goal==="mate"&&!game.isCheckmate()) return {valid:false,reason:"Solution does not checkmate"};
    if(p.goal==="promotion"&&!move.promotion) return {valid:false,reason:"Solution does not promote"};
    if(p.goal==="capture"&&!move.captured) return {valid:false,reason:"Solution does not capture"};
    return {valid:true};
  }catch(e){return {valid:false,reason:String(e?.message||e)};}
}
function currentPuzzle(){return puzzleList()[state.puzzleIndex]||null;}
function renderPuzzleBoard(){
  const el=$("#puzzleBoard"); if(!el)return;
  const game=state.puzzleGame; if(!game){el.innerHTML='<p class="muted">No valid puzzle available.</p>';return;}
  el.innerHTML="";
  const board=game.board();
  for(let r=0;r<8;r++)for(let f=0;f<8;f++){
    const rank=8-r,file=String.fromCharCode(97+f),sq=file+rank,p=board[r][f];
    const d=document.createElement("button"); d.type="button"; d.className=`puzzle-square ${(r+f)%2?"dark":"light"} ${sq===state.puzzleSelected?"selected":""}`; d.dataset.square=sq; d.setAttribute("aria-label",`${sq}${p?`, ${p.color==="w"?"White":"Black"} ${p.type}`:""}`);
    if(p)d.innerHTML=pieceMarkup(p,"puzzle-piece-art");
    if(f===0||r===7)d.insertAdjacentHTML("beforeend",`<span class="puzzle-coord">${f===0?rank:""}${r===7?file:""}</span>`);
    d.onclick=()=>puzzleSquareClick(sq); el.appendChild(d);
  }
}
function renderPuzzleLab(){
  const list=puzzleList();
  $("#puzzleDueCount").textContent=puzzleDueCount();
  if(!list.length){$("#puzzleTitle").textContent=state.puzzleReviewMode?"No puzzles due right now":"No puzzles in this category";$("#puzzlePrompt").textContent=state.puzzleReviewMode?"Your next puzzle review is scheduled for later.":"Try another category.";$("#puzzleFeedback").textContent=state.puzzleReviewMode?"You are caught up. Switch off Review due to practice any puzzle.":"No puzzle data available in this category.";$("#puzzleBoard").innerHTML="";$("#puzzleStats").textContent=`Solved ${state.puzzleSolved.length} of ${BOARD_PUZZLES.length}`;return;}
  state.puzzleIndex=Math.max(0,Math.min(state.puzzleIndex,list.length-1));
  const p=list[state.puzzleIndex];
  const valid=validatePuzzle(p);
  $("#puzzleCount").textContent=`${list.filter(x=>validatePuzzle(x).valid).length}/${list.length} verified${state.puzzleReviewMode?" · DUE REVIEW":""}`;
  $("#puzzleDifficulty").textContent=p.level.toUpperCase();$("#puzzleType").textContent=p.category.toUpperCase();
  $("#puzzleTitle").textContent=p.title;$("#puzzlePrompt").textContent=p.prompt;
  const solved=state.puzzleSolved.includes(p.id),attempts=state.puzzleAttempts[p.id]||0;
  $("#puzzleStats").textContent=`Solved ${state.puzzleSolved.length} of ${BOARD_PUZZLES.length} · Attempts on this puzzle: ${attempts}`;
  if(!valid){$("#puzzleFeedback").textContent=`Puzzle disabled: ${valid.reason}.`;state.puzzleGame=null;renderPuzzleBoard();return;}
  if(!state.puzzleGame||state.puzzleGame.fen()!==p.fen||state._loadedPuzzleId!==p.id){state.puzzleGame=new Chess(p.fen);state.puzzleSelected=null;state.puzzleRevealed=false;state._loadedPuzzleId=p.id;}
  if(!state.puzzleRevealed&&!solved)$("#puzzleFeedback").textContent="Select a piece, then its destination square.";
  else if(solved&&!state.puzzleRevealed)$("#puzzleFeedback").textContent="Already solved. Try it again from Reset position or move to the next puzzle.";
  renderPuzzleBoard();
}
function puzzleSquareClick(sq){
  const p=currentPuzzle(),game=state.puzzleGame;if(!p||!game||state.puzzleRevealed)return;
  const piece=game.get(sq);
  if(!state.puzzleSelected){if(piece&&piece.color===game.turn()){state.puzzleSelected=sq;renderPuzzleBoard();}return;}
  if(piece&&piece.color===game.turn()){state.puzzleSelected=sq;renderPuzzleBoard();return;}
  try{
    const candidate=new Chess(game.fen());
    const move=candidate.move({from:state.puzzleSelected,to:sq,promotion:"q"});
    if(move.san===p.solution){
      state.puzzleGame=candidate;state.puzzleSelected=null;
      if(!state.puzzleSolved.includes(p.id)){state.puzzleSolved.push(p.id);localStorage.setItem("coa_puzzle_solved",JSON.stringify(state.puzzleSolved));}
      state.puzzleAttempts[p.id]=(state.puzzleAttempts[p.id]||0)+1;localStorage.setItem("coa_puzzle_attempts",JSON.stringify(state.puzzleAttempts));schedulePuzzleReview(p,true);$("#puzzleDueCount").textContent=puzzleDueCount();
      $("#puzzleFeedback").textContent=`Correct: ${move.san}. Review in ${state.puzzleReviews[p.id].intervalDays} day(s). ${p.explanation}`;renderPuzzleBoard();renderCourseRoadmap();$("#puzzleStats").textContent=`Solved ${state.puzzleSolved.length} of ${BOARD_PUZZLES.length} · Attempts on this puzzle: ${state.puzzleAttempts[p.id]}`;
    }else{
      state.puzzleAttempts[p.id]=(state.puzzleAttempts[p.id]||0)+1;localStorage.setItem("coa_puzzle_attempts",JSON.stringify(state.puzzleAttempts));schedulePuzzleReview(p,false);$("#puzzleDueCount").textContent=puzzleDueCount();state.puzzleSelected=null;
      $("#puzzleFeedback").textContent=`That move is legal, but it doesn't meet the puzzle goal. A retry is scheduled in 10 minutes. ${p.hint}`;renderPuzzleBoard();$("#puzzleStats").textContent=`Solved ${state.puzzleSolved.length} of ${BOARD_PUZZLES.length} · Attempts on this puzzle: ${state.puzzleAttempts[p.id]}`;
    }
  }catch{state.puzzleSelected=null;renderPuzzleBoard();}
}
function resetPuzzle(){const p=currentPuzzle();if(!p)return;state.puzzleGame=new Chess(p.fen);state.puzzleSelected=null;state.puzzleRevealed=false;state._loadedPuzzleId=p.id;renderPuzzleBoard();$("#puzzleFeedback").textContent="Position reset. Find the solution yourself.";}
function revealPuzzleSolution(){const p=currentPuzzle();if(!p||!validatePuzzle(p).valid)return;state.puzzleGame=new Chess(p.fen);state.puzzleGame.move(p.solution);state.puzzleSelected=null;state.puzzleRevealed=true;renderPuzzleBoard();$("#puzzleFeedback").textContent=`Solution: ${p.solution}. ${p.explanation}`;}
function movePuzzle(delta){const list=puzzleList();if(!list.length){renderPuzzleLab();return;}state.puzzleIndex=(state.puzzleIndex+delta+list.length)%list.length;state._loadedPuzzleId=null;state.puzzleGame=null;state.puzzleSelected=null;state.puzzleRevealed=false;renderPuzzleLab();}

function setMode(m){
  if(m==="repertoire"){
    if(!state.opening){toast("Select an opening first.");return;}
    const id=state.opening.id;
    if(state.repertoire.includes(id)){state.repertoire=state.repertoire.filter(x=>x!==id);toast("Removed from repertoire.");}
    else{state.repertoire.push(id);toast("Added to your repertoire.");}
    save();
  }
  state.mode=m;
  document.querySelectorAll(".mode").forEach(x=>x.classList.toggle("active",x.dataset.mode===m));
  renderLesson();
  if(m==="train")openTrain();
}
const layoutEl=$(".layout");
$("#libraryToggle").onclick=()=>{
  const open=layoutEl.classList.toggle("mobile-library-open");
  layoutEl.classList.remove("mobile-tools-open");
  $("#libraryToggle").setAttribute("aria-expanded",String(open));
  $("#toolsToggle").setAttribute("aria-expanded","false");
};
$("#toolsToggle").onclick=()=>{
  const open=layoutEl.classList.toggle("mobile-tools-open");
  layoutEl.classList.remove("mobile-library-open");
  $("#toolsToggle").setAttribute("aria-expanded",String(open));
  $("#libraryToggle").setAttribute("aria-expanded","false");
};
document.querySelectorAll(".filter").forEach(x=>x.onclick=()=>{state.filter=x.dataset.filter;document.querySelectorAll(".filter").forEach(y=>y.classList.toggle("active",y===x));renderList()});
$("#searchInput").oninput=renderList;
document.querySelectorAll(".mode").forEach(x=>x.onclick=()=>setMode(x.dataset.mode));
$("#themeBtn").onclick=()=>document.body.classList.toggle("light");
$("#resetBtn").onclick=()=>{if(confirm("Reset local progress and repertoire?")){localStorage.removeItem("coa_stats");localStorage.removeItem("coa_repertoire");localStorage.removeItem("coa_mastered");localStorage.removeItem("coa_line_progress");localStorage.removeItem("coa_review_cards");location.reload()}};
$("#flipBtn").onclick=()=>{state.flipped=!state.flipped;renderBoard()};
$("#startBtn").onclick=()=>{state.chess=new Chess();state.selected=null;state.redo=[];state.lastMove=null;renderAll();loadExplorer()};
$("#backBtn").onclick=()=>{const m=state.chess.undo();if(m)state.redo.push(m);const hist=state.chess.history({verbose:true}),last=hist[hist.length-1];state.lastMove=last?{from:last.from,to:last.to}:null;state.selected=null;renderAll();loadExplorer()};
$("#forwardBtn").onclick=()=>{const m=state.redo.pop();if(m){try{const moved=state.chess.move(m);state.lastMove={from:moved.from,to:moved.to};state.selected=null;renderAll();loadExplorer()}catch{state.redo=[]}}else toast("No move to redo.")};
$("#fenBtn").onclick=async()=>{try{await navigator.clipboard.writeText(state.chess.fen());toast("FEN copied")}catch{$("#fenInput").value=state.chess.fen();toast("FEN placed in the field; copy it manually.")}};
$("#saveCustomPgnLine").onclick=saveCurrentGameAsCustomLine;$("#exportFullRepertoire").onclick=exportFullRepertoirePgn;
document.querySelectorAll("[data-promotion]").forEach(b=>b.onclick=()=>completePromotion(b.dataset.promotion));$("#cancelPromotion").onclick=()=>{state.pendingPromotion=null;$("#promotionDialog").close();state.selected=null;renderBoard();};
$("#importPgn").onclick=()=>{
  const pgn=$("#pgnInput").value.trim();
  if(!pgn){toast("Paste a PGN first.");return;}
  try{const imported=new Chess();imported.loadPgn(pgn);state.chess=imported;state.selected=null;state.redo=[];state.variationPly=0;const importedHist=imported.history({verbose:true}),importedLast=importedHist[importedHist.length-1],comments=typeof imported.getComments==="function"?imported.getComments():[];state.lastMove=importedLast?{from:importedLast.from,to:importedLast.to}:null;renderAll();loadExplorer();toast(comments.length?`PGN imported with ${comments.length} comment(s). Save it as a study line to retain them in position notes.`:"PGN imported.");}
  catch(e){console.warn("PGN import failed",e);toast("PGN could not be parsed. Check its notation.");}
};
$("#exportPgn").onclick=()=>{
  const pgn=state.chess.pgn();$("#pgnInput").value=pgn||"";
  if(!pgn){toast("No moves to export yet.");return;}
  $("#pgnInput").focus();$("#pgnInput").select();
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(pgn).then(()=>toast("PGN copied to clipboard.")).catch(()=>toast("PGN is in the text field; copy it manually."));
  else toast("PGN is in the text field; copy it manually.");
};
$("#loadFen").onclick=()=>{try{state.chess.load($("#fenInput").value.trim());state.selected=null;state.redo=[];state.lastMove=null;renderAll();loadExplorer()}catch{toast("Invalid FEN")}};
function showLessonPosition(){
  if(!state.opening)return;
  const maxPly=Math.max(0,Math.min(state.opening.moves.length,Math.round((state.lesson+1)/state.opening.why.length*state.opening.moves.length)));
  applyMoves(state.opening.moves.slice(0,maxPly)); state.redo=[]; renderAll(); loadExplorer();
}
$("#nextLesson").onclick=()=>{if(state.opening){state.lesson=Math.min(state.lesson+1,state.opening.why.length-1);showLessonPosition()}};
$("#prevLesson").onclick=()=>{if(state.opening){state.lesson=Math.max(0,state.lesson-1);showLessonPosition()}};
$("#trainBtn").onclick=openTrain; $("#loadVariation").onclick=loadActiveVariation; $("#practiceVariation").onclick=openTrain; $("#closeTrain").onclick=()=>{ $("#trainDialog").close(); $("#closeTrain").textContent="×"; };
$("#rehearseVariation").onclick=openLineRehearsal;$("#closeLineRehearsal").onclick=()=>$("#lineRehearsalDialog").close();$("#finishRehearsal").onclick=()=>$("#lineRehearsalDialog").close();$("#restartRehearsal").onclick=restartLineRehearsal;$("#rehearsalSide").onchange=()=>restartLineRehearsal();
document.querySelectorAll(".card-tab").forEach((x,i)=>x.onclick=()=>{document.querySelectorAll(".card-tab").forEach(y=>y.classList.remove("active"));x.classList.add("active");$("#whyPanel").textContent=i===0?"Click moves to explore the position.":"Use the lesson text below to understand why the move exists, not just memorize notation.";});
document.querySelectorAll(".pattern-filter").forEach(b=>b.onclick=()=>{state.patternFilter=b.dataset.patternFilter;document.querySelectorAll(".pattern-filter").forEach(x=>x.classList.toggle("active",x===b));state.activePattern=null;state.patternAnswerVisible=false;renderPatternTrainer();});
$("#revealPattern").onclick=()=>{state.patternAnswerVisible=!state.patternAnswerVisible;renderPatternTrainer();};
document.querySelectorAll(".analytics-filter").forEach(b=>b.onclick=()=>{analyticsFilter=b.dataset.analyticsFilter;document.querySelectorAll(".analytics-filter").forEach(x=>x.classList.toggle("active",x===b));renderOpeningAnalytics();});
document.querySelectorAll(".coverage-filter").forEach(b=>b.onclick=()=>{coverageFilter=b.dataset.coverageFilter;document.querySelectorAll(".coverage-filter").forEach(x=>x.classList.toggle("active",x===b));renderCurriculumCoverage();});
$("#refreshDataHealth").onclick=renderDataHealth;
$("#analyzePosition").onclick=analyzeCurrentPosition;$("#stopAnalysis").onclick=stopEngineAnalysis;$("#saveEngineAnalysis").onclick=saveEngineAnalysisToNotes;$("#checkEngine").onclick=checkEngineConnection;$("#clearEngineLog").onclick=()=>{engineLogLines=[];$("#engineLog").textContent="Log cleared.";};
$("#exportBackup").onclick=exportProgressBackup;$("#importBackup").onclick=importProgressBackup;
$("#nextPattern").onclick=nextPattern;
document.querySelectorAll(".puzzle-filter").forEach(b=>b.onclick=()=>{state.puzzleFilter=b.dataset.puzzleFilter;state.puzzleIndex=0;state._loadedPuzzleId=null;state.puzzleReviewMode=false;$("#reviewPuzzlesDue").classList.remove("active");document.querySelectorAll(".puzzle-filter").forEach(x=>x.classList.toggle("active",x===b));renderPuzzleLab();});
$("#reviewPuzzlesDue").onclick=()=>{state.puzzleReviewMode=!state.puzzleReviewMode;state.puzzleIndex=0;state._loadedPuzzleId=null;state.puzzleGame=null;$("#reviewPuzzlesDue").classList.toggle("active",state.puzzleReviewMode);renderPuzzleLab();};
$("#resetPuzzle").onclick=resetPuzzle;$("#showPuzzleSolution").onclick=revealPuzzleSolution;$("#prevPuzzle").onclick=()=>movePuzzle(-1);$("#nextPuzzle").onclick=()=>movePuzzle(1);

try{
  const mastered=readStored("coa_mastered",[]);
  state.stats.mastered=mastered.length;
}catch{state.stats.mastered=0;}
renderStats(); renderQueue(); renderSavedLineQueue(); renderCustomLineQueue(); renderList(); renderPatternTrainer(); renderPuzzleLab(); renderCourseRoadmap(); renderOpeningAnalytics(); renderCurriculumCoverage(); renderDataHealth(); selectOpening("italian");
document.documentElement.dataset.appReady="true";const dependencyBanner=$("#dependencyBanner");if(dependencyBanner)dependencyBanner.hidden=true;
