export function displayStatus(unit) {
    const statusDisplay = document.getElementById("status-display");
    if (unit) {
        statusDisplay.innerHTML = `
            <strong>${unit.type}</strong><br>
            HP: ${unit.hp}<br>
            攻撃: ${unit.attack}<br>
            防御: ${unit.defense}<br>
            移動範囲: ${unit.move}<br>
            攻撃範囲: ${unit.range}
        `;
    } else {
        statusDisplay.innerHTML = "ユニットが選択されていません";
    }
}

export function updateMessageDisplay(message) {
    const messageDisplay = document.getElementById("message-display");
    messageDisplay.textContent = message;
}
