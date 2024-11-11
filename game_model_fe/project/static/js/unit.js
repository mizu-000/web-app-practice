// unit.js

// isMovable関数を修正して、移動済みフラグも確認
export function isMovable(row, col, unit) {
    if (unit.moved) return false;  // 既に移動済みの場合は移動不可
    const distance = Math.abs(row - unit.row) + Math.abs(col - unit.col);
    return distance <= unit.move;
}

// 駒を移動（他の駒がない場合にのみ移動）
export function moveUnit(unit, targetRow, targetCol, team1Units, team2Units) {
    const allUnits = [...team1Units, ...team2Units];
    const targetOccupied = allUnits.some(u => u.row === targetRow && u.col === targetCol);

    // 移動先が他のユニットで埋まっている場合は移動しない
    if (targetOccupied) {
        alert("そのマスには別の駒がいます！");
        return false;
    }

    // 駒を移動し、移動済みとしてフラグを設定
    unit.row = targetRow;
    unit.col = targetCol;
    unit.moved = true;  // 1ターンで複数回移動しないようにフラグを設定
    return true;
}

// チーム内のすべての駒の`moved`フラグをリセット
export function resetMoves(units) {
    units.forEach(unit => unit.moved = false);
}

// 指定された位置に敵ユニットがあるか確認
export function findUnit(row, col, units) {
    return units.find(unit => unit.row === row && unit.col === col);
}
