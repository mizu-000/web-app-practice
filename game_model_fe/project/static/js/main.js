import { initializeBoard, placeUnits, renderBoard } from './board.js';
import { moveUnit, findUnit, resetMoves, isMovable } from './unit.js';
import { highlightMovableCells, clearHighlights, highlightMovableUnits, highlightAttackableCells } from './highlight.js';
import { attack, promptAttackTarget, getEnemiesInAttackRange, isAttackable } from './attack.js';
import { displayStatus, updateMessageDisplay } from './statusDisplay.js';

let currentPlayer = 1;
let team1Units = [];
let team2Units = [];
let selectedUnit = null;

const unitData = {
    infantry: { hp: 10, attack: 10, defense: 5, range: 1, move: 1, icon: '⚔️' },
    archer: { hp: 5, attack: 10, defense: 5, range: 3, move: 1, icon: '🏹' },
    cavalry: { hp: 10, attack: 10, defense: 8, range: 1, move: 3, icon: '🐎' },
    king: { hp: 20, attack: 20, defense: 8, range: 1, move: 2, icon: '👑' },
};

// セルクリック時のイベント
function onCellClick(e) {
    const cell = e.currentTarget;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const unit = findUnit(row, col, currentPlayer === 1 ? team1Units : team2Units);

    if (selectedUnit) {
        if (selectedUnit === unit) {
            selectedUnit = null;
            clearHighlights();
            displayStatus(null);
            highlightMovableUnits(currentPlayer === 1 ? team1Units : team2Units);
        } else if (unit) {
            selectedUnit = unit;
            displayStatus(unit);
            clearHighlights();
            highlightMovableCells(selectedUnit);
            highlightAttackableCells(selectedUnit);
        } else if (isMovable(row, col, selectedUnit)) {
            const moved = moveUnit(selectedUnit, row, col, team1Units, team2Units);
            if (moved) {
                clearHighlights();
                renderBoard([...team1Units, ...team2Units]);
                const enemiesInRange = getEnemiesInAttackRange(selectedUnit, currentPlayer === 1 ? team2Units : team1Units);
                if (enemiesInRange.length > 0) {
                    promptAttackTarget(selectedUnit, enemiesInRange,team1Units, team2Units);
                }
                selectedUnit = null;
                highlightMovableUnits(currentPlayer === 1 ? team1Units : team2Units);
            }
        }
    } else if (unit) {
        selectedUnit = unit;
        displayStatus(unit);
        clearHighlights();
        highlightMovableCells(selectedUnit);
        highlightAttackableCells(selectedUnit);
    }
    
}

// ターンの終了
function endTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    clearHighlights();
    selectedUnit = null;

    resetMoves(currentPlayer === 1 ? team1Units : team2Units);
    updateMessageDisplay(`チーム${currentPlayer}のターンです`);
    renderBoard([...team1Units, ...team2Units]);
    highlightMovableUnits(currentPlayer === 1 ? team1Units : team2Units);
}

// 初期化処理
initializeBoard(onCellClick);
placeUnits(['cavalry','infantry', 'archer', 'king', 'archer', 'infantry','cavalry'], 1, team1Units, unitData);
placeUnits(['cavalry','infantry', 'archer', 'king', 'archer', 'infantry','cavalry'], 2, team2Units, unitData);

document.getElementById('end-turn-button').addEventListener('click', endTurn);

renderBoard([...team1Units, ...team2Units]);
highlightMovableUnits(team1Units);
updateMessageDisplay(`チーム${currentPlayer}のターンです`);
