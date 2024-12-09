let allBooks = []; // すべての取得した本を保持する配列
const booksPerPage = 20; // 1ページあたりの表示件数

// 書籍検索関数
async function searchBooks() {
    const sort = document.getElementById('sortOption')?.value;
    const query = document.getElementById('searchQuery')?.value.trim();
    const resultsDiv = document.getElementById('results');
    const paginationDiv = document.getElementById('pagination');

    resultsDiv.innerHTML = "検索中...";
    paginationDiv.innerHTML = ""; // ページリンクのリセット

    if (!query) {
        alert("検索キーワードを入力してください！");
        resultsDiv.innerHTML = "";
        return;
    }

    try {
        allBooks = []; // 前回の検索結果をクリア

        // 200件を取得するために40件ずつ5回リクエスト
        for (let startIndex = 0; startIndex < 200; startIndex += 40) {
            const response = await fetch(`/search?query=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=40&orderBy=${sort}`);
            const data = await response.json();

            if (data.items) {
                allBooks = allBooks.concat(data.items); // 結果を結合
            }
        }

        if (allBooks.length > 0) {
            displayBooks(1); // 最初のページを表示
        } else {
            resultsDiv.innerHTML = "結果が見つかりませんでした。";
        }
    } catch (error) {
        console.error("検索中にエラーが発生しました:", error);
        resultsDiv.innerHTML = "エラーが発生しました。再試行してください。";
    }
}

// 本を表示する関数
function displayBooks(page) {
    const resultsDiv = document.getElementById('results');
    const paginationDiv = document.getElementById('pagination');

    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksToDisplay = allBooks.slice(start, end);

    resultsDiv.innerHTML = "";

    booksToDisplay.forEach(item => {
        const volumeInfo = item.volumeInfo || {};
        const title = volumeInfo.title || "タイトル不明";
        const authors = (volumeInfo.authors || []).join(', ') || "著者不明";
        const publishedDate = volumeInfo.publishedDate || "日付不明";
        const description = volumeInfo.description || "説明なし";

        const bookDiv = document.createElement('div');
        bookDiv.className = "result-item";

        bookDiv.innerHTML = `
            <h3>${title}</h3>
            <p><strong>著者:</strong> ${authors}</p>
            <p><strong>出版日:</strong> ${publishedDate}</p>
            <p>${description}</p>
            <button onclick="addToFavorites('${title}', '${authors}', '${publishedDate}', '${description}')">
                ❤️ お気に入りに追加
            </button>
        `;

        resultsDiv.appendChild(bookDiv);
    });

    generatePagination(page);
}

// ページリンクを生成する関数
function generatePagination(currentPage) {
    const paginationDiv = document.getElementById('pagination');
    const totalPages = Math.ceil(allBooks.length / booksPerPage);

    paginationDiv.innerHTML = "";

    // 前のページリンク
    if (currentPage > 1) {
        const prevLink = document.createElement('a');
        prevLink.textContent = "前へ";
        prevLink.href = "#";
        prevLink.onclick = () => displayBooks(currentPage - 1);
        paginationDiv.appendChild(prevLink);
        paginationDiv.appendChild(document.createTextNode(" "));
    }

    // ページ番号リンク
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.textContent = i;
        pageLink.href = "#";
        if (i === currentPage) {
            pageLink.style.fontWeight = "bold";
        } else {
            pageLink.onclick = () => displayBooks(i);
        }
        paginationDiv.appendChild(pageLink);
        paginationDiv.appendChild(document.createTextNode(" "));
    }

    // 次のページリンク
    if (currentPage < totalPages) {
        const nextLink = document.createElement('a');
        nextLink.textContent = "次へ";
        nextLink.href = "#";
        nextLink.onclick = () => displayBooks(currentPage + 1);
        paginationDiv.appendChild(nextLink);
    }
}


async function addToFavorites(title, authors, publishedDate, description) {
    const response = await fetch('/add_favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, authors, publishedDate, description })
    });

    const result = await response.json();
    alert(result.message);
}
