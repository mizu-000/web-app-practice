// highlight.js

// ハイライトをクリア
export function clearHighlights() {
    document.querySelectorAll('.highlight, .selected-unit, .attackable').forEach(cell => {
        cell.classList.remove('highlight', 'selected-unit', 'attackable');
    });
}

// 移動可能なユニットに薄緑の背景を適用
export function highlightMovableUnits(units) {
    clearHighlights();
    units.forEach(unit => {
        const unitCell = document.querySelector(`.cell[data-row="${unit.row}"][data-col="${unit.col}"]`);
        if (unitCell) {
            unitCell.classList.add('selected-unit');
        }
    });
}

// 移動可能範囲のハイライト
export function highlightMovableCells(unit) {
    clearHighlights();  // 新しいハイライトを設定する前にすべてクリア
    
    // 選択された駒に薄緑の背景を付与
    const unitCell = document.querySelector(`.cell[data-row="${unit.row}"][data-col="${unit.col}"]`);
    if (unitCell) {
        unitCell.classList.add('selected-unit');
    }
    
    const range = unit.move;
    for (let i = -range; i <= range; i++) {
        for (let j = -range; j <= range; j++) {
            const newRow = unit.row + i;
            const newCol = unit.col + j;
            if (isWithinBounds(newRow, newCol) && Math.abs(i) + Math.abs(j) <= range) {
                const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                if (cell) {
                    cell.classList.add('highlight');  // 移動可能範囲を薄緑でハイライト
                }
            }
        }
    }
}

// 攻撃可能範囲のハイライト
export function highlightAttackableCells(unit) {
    const range = unit.range;
    
    // 攻撃可能範囲を赤でハイライト
    for (let i = -range; i <= range; i++) {
        for (let j = -range; j <= range; j++) {
            const newRow = unit.row + i;
            const newCol = unit.col + j;
            if (isWithinBounds(newRow, newCol) && Math.abs(i) + Math.abs(j) <= range) {
                const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                if (cell && !cell.classList.contains('highlight')) {  // 移動範囲のセルを優先
                    cell.classList.add('attackable');  // 攻撃可能範囲を赤でハイライト
                }
            }
        }
    }
}

// 範囲内かどうかの判定
function isWithinBounds(row, col) {
    return row >= 0 && row < 9 && col >= 0 && col < 9;
}
