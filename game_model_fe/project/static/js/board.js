// board.js
export function initializeBoard(onCellClick) {
    const boardContainer = document.getElementById("game-board");
    boardContainer.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", onCellClick);
            boardContainer.appendChild(cell);
        }
    }
}

// ボードを再描画し、ユニットのアイコンを正しい位置に配置
export function renderBoard(units) {
    // 全セルを一旦クリア
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => (cell.textContent = ""));

    // 各ユニットの位置にアイコンを描画
    units.forEach(unit => {
        const cell = document.querySelector(`.cell[data-row="${unit.row}"][data-col="${unit.col}"]`);
        if (cell) {
            cell.textContent = unit.icon;  // ユニットのアイコンを描画
        }
    });
}

// チームの駒をボードに配置
export function placeUnits(unitTypes, team, teamUnits, unitData) {
    const startRow = team === 1 ? 0 : 8;
    const direction = team === 1 ? 1 : -1;

    unitTypes.forEach((type, index) => {
        const row = startRow;
        const col = index;
        const unit = { ...unitData[type], row, col, type, team, moved: false };
        teamUnits.push(unit);
    });
}
