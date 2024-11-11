// attack.js
import { renderBoard } from './board.js';

export function attack(attacker, defender, team1Units, team2Units) {
    const damage = Math.max(0, attacker.attack - defender.defense);
    defender.hp -= damage;
    alert(`${attacker.type} が ${defender.type} に ${damage} のダメージを与えた！`);

    if (defender.hp <= 0) {
        alert(`${defender.type} が倒されました！`);
        // ユニットをチームから削除
        const team = defender.team === 1 ? team1Units : team2Units;
        const index = team.indexOf(defender);
        if (index !== -1) {
            team.splice(index, 1);  // ユニットを削除
        }
        // ユニット削除後にボードを再描画して即座に反映
        renderBoard([...team1Units, ...team2Units]);
    }
}

// 攻撃範囲内の敵を取得する関数
export function getEnemiesInAttackRange(unit, enemyUnits) {
    return enemyUnits.filter(enemy => isAttackable(enemy.row, enemy.col, unit));
}

// 攻撃対象の選択を促す関数
export function promptAttackTarget(unit, enemies, team1Units, team2Units) {
    const options = enemies.map((enemy, index) => `${index + 1}: ${enemy.type} (HP: ${enemy.hp})`).join('\n');
    const choice = prompt(`攻撃対象を選んでください:\n${options}`);

    if (choice) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < enemies.length) {
            attack(unit, enemies[index], team1Units, team2Units);
        } else {
            alert("無効な選択です");
        }
    }
}

// 攻撃範囲内かどうかを判定する関数
export function isAttackable(row, col, unit) {
    const range = unit.range;
    const distance = Math.abs(row - unit.row) + Math.abs(col - unit.col);
    return distance <= range;
}
