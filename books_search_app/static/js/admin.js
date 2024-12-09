

async function deleteUser(userId) {
    if (!confirm("本当にこのユーザを削除しますか？")) return;

    const response = await fetch('/delete_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
    });

    const result = await response.json();
    alert(result.message);
    location.reload();
}
