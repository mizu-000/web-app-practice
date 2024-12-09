

// お気に入りの削除処理
async function deleteFavorite(title) {
    if (!confirm(`『${title}』を削除しますか？`)) {
        return;
    }

    const response = await fetch('/delete_favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
    });

    const result = await response.json();
    alert(result.message);

    // 削除後にページをリロード
    location.reload();
}
