// attack.js
import { renderBoard } from './board.js';
let gameOver = false; // 勝敗判定フラグ

export function attack(attacker, defender, team1Units, team2Units) {
    if (gameOver) return; // ゲーム終了後は無効
    const damage = Math.max(0, attacker.attack - defender.defense);
    defender.hp -= damage;
    alert(`${attacker.type} が ${defender.type} に ${damage} のダメージを与えた！`);

    if (defender.hp <= 0) {
        alert(`${defender.type} が倒されました！`);
        console.log("Defenderオブジェクト:", defender);
        // 勝敗判定処理
        if (defender.type === 'king') {
            const winner = defender.team === 1 ? 'チーム2' : 'チーム1';
            alert(`${winner}の勝利です！`);
            gameOver = true;
            setupResetOnClick(); // ゲームリセット準備
            return;
        }
        console.log("Defenderのチーム:", defender.team);
        console.log("チーム1のユニット一覧:", team1Units);
        console.log("チーム2のユニット一覧:", team2Units);

        // チームを確認してユニットを削除
        const team = defender.team === 1 ? team1Units : defender.team === 2 ? team2Units : null;
        if (team !== null) {
            const index = team.indexOf(defender);
            if (index !== -1) {
                team.splice(index, 1);  // ユニットを削除
                renderBoard([...team1Units, ...team2Units]); // ボードを再描画
            } else {
                console.error("ユニットがチームから見つかりませんでした。");
            }
        } else {
            console.error("不明なチームです。defenderにteamプロパティが設定されていることを確認してください。");
        }
    } else {
        renderBoard([...team1Units, ...team2Units]); // ボードを再描画
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

// ゲームリセットのクリック設定
function setupResetOnClick() {
    document.body.addEventListener('click', resetGame, { once: true });
}

// ゲームリセット処理
function resetGame() {
    gameOver = false; // 勝敗フラグ解除
    location.reload(); // ページをリロードしてリセット
}