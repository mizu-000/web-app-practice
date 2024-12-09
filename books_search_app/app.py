import requests
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, render_template, request, session,redirect,url_for,jsonify, flash
import MySQLdb
import secrets
from datetime import timedelta,datetime
import json
import os
from dotenv import load_dotenv

app = Flask(__name__)
app.json.ensure_ascii = False  
app.secret_key = secrets.token_urlsafe(16)
app.permanent_session_lifetime = timedelta(minutes=60)
CACHE_TTL = 3600  # キャッシュの有効期限（秒）


# .envファイルを読み込む
load_dotenv()
# Google Books APIキーを指定
API_KEY = os.getenv("API_KEY")  

# データベース接続
db = MySQLdb.connect(
    host="localhost",
    user="root",
    passwd="Mizuki@3",
    db="abc",
    use_unicode=True,
    charset='utf8'
)




@app.route('/')
def defo():
    return redirect(url_for('login'))

@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    elif request.method == 'POST':
        username = request.form['username']
        passwd = request.form['password']
        hashpass = generate_password_hash(passwd)
        cur = db.cursor()
        cur.execute("""
                    SELECT * FROM users WHERE username =%(username)s
                    """, {'username': username})
        if cur.fetchone():
            return render_template('register.html',msg='そのユーザー名は既に使われています。')
        db.commit()
        
        cur.execute("""
                    INSERT INTO users (username, password) VALUES (%s, %s)
                    """, (username, hashpass))
        db.commit()
        
        return render_template('login.html',msg='登録が完了しました。ログインしてください。')



@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'GET':
        session.clear()
        return render_template('login.html')
    elif request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cursor = db.cursor()
        cursor.execute("""
                       SELECT id,password,admin
                       FROM users 
                       WHERE username = %(username)s
                       """, {'username': username})
        
        user = cursor.fetchone()
        cursor.close()
        if user is None:
            
            return render_template('login.html',msg='ユーザー名が登録されていません！')
        elif check_password_hash(user[1], password):
            session['user_id'] = user[0]
            session['username'] = username
            session['admin'] = user[2]
            
            
            return redirect(url_for('index'))
        else:
            
            return render_template('login.html',msg='ユーザー名またはパスワードが間違っています。')

@app.route('/admin')
def admin():
    if not session.get('user_id'):
        return redirect(url_for('error', msg='無効なアクセスです。ログインしてください'))
    if(session['admin']==0):
        return redirect(url_for('error', msg='無効なアクセスです。管理者権限がありません。'))
    query = "SELECT id, username, admin FROM users"
    cur.execute(query)
    users = cur.fetchall()
    return render_template('admin.html', users=users)

@app.route('/delete_user', methods=['POST'])
def delete_user():
    data = request.json
    user_id = data.get('user_id')
    
    query = "DELETE FROM users WHERE id = %s"
    cur.execute(query, (user_id,))
    db.commit()
    return jsonify({"message": "ユーザを削除しました。"})





@app.route('/index')
def index():
    if not session.get('user_id'):
        return redirect(url_for('error', msg='無効なアクセスです。ログインしてください'))
    
    if(session['admin']==1):
        msg='管理者としてログインしています。'
        admin="<a href=\"admin\">管理者ページ</a>"
        return render_template('index.html',msg=msg,admin=admin)
    username=session['username']+"さん、こんにちは！"
    return render_template('index.html',username=username)

        
@app.route('/logout')
def logout():
    session.clear()
    return render_template('login.html',msg='ログアウトしました。')

@app.route('/error')
def error():
    msg = request.args.get('msg')
    return render_template('error.html', msg=msg)


@app.route('/search', methods=['GET'])
def search_books():
    query = request.args.get('query', '').strip()
    start_index = int(request.args.get('startIndex', 0))
    max_results = int(request.args.get('maxResults', 40))
    sort = request.args.get('orderBy', 'relevance')

    if not query:
        return jsonify({"error": "検索クエリが必要です"}), 400

    # キャッシュ確認
    cache_query = """
        SELECT result, timestamp 
        FROM book_search_cache 
        WHERE query = %s  AND start_index = %s AND max_results = %s
    """
    cur.execute(cache_query, (query+sort, start_index, max_results))
    cache_row = cur.fetchone()

    if cache_row:
        # キャッシュが有効期限内か確認
        print(cache_row[1])
        cache_time = cache_row[1]
        if datetime.now() - cache_time < timedelta(seconds=CACHE_TTL):
            print(0)
            return jsonify(json.loads(cache_row[0]))

    # APIリクエスト
    GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"
    params = {
        'q': query,
        'startIndex': start_index,
        'maxResults': max_results,
        'orderBy': sort,
    }

    response = requests.get(GOOGLE_BOOKS_API_URL, params=params)
    if response.status_code != 200:
        print(f"Error {response.status_code}: {response.text}")
        return jsonify({"error": "Google Books APIのリクエストに失敗しました"}), 500

    data = response.json()
    print(1)

    # 結果をキャッシュに保存
    upsert_query = """
        INSERT INTO book_search_cache (query, start_index, max_results, result, timestamp)
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE result = VALUES(result), timestamp = VALUES(timestamp)
    """
    cur.execute(upsert_query, (query+sort, start_index, max_results, json.dumps(data)))
    db.commit()

    return jsonify(data)


@app.route('/add_favorite', methods=['POST'])
def add_favorite():
    if not session.get('user_id'):
        return redirect(url_for('error', msg='無効なアクセスです。ログインしてください'))
    
    data = request.json
    user_id = session['user_id']
    title = data.get('title')
    authors = data.get('authors')
    published_date = data.get('publishedDate')
    description = data.get('description')

    try:
        cur.execute(
            "INSERT INTO likebooks (user_id, title, authors, date, summary) VALUES (%s, %s, %s, %s, %s)",
            (user_id, title, authors, published_date, description)
        )
        db.commit()
        return jsonify({"message": "お気に入りに追加しました"})
    except MySQLdb.IntegrityError:
        return jsonify({"message": "この本は既にお気に入りに登録されています"})
    except Exception as e:
        return jsonify({"message": f"エラーが発生しました: {str(e)}"}), 500

@app.route('/favorites', methods=['GET'])
def view_favorites():
    if not session.get('user_id'):
        return redirect(url_for('error', msg='無効なアクセスです。ログインしてください'))
    
    user_id = session['user_id']
    cur.execute("SELECT title, authors, date, summary FROM likebooks WHERE user_id = %s", (user_id,))
    favorites = cur.fetchall()
    return render_template('favorites.html', favorites=favorites)

@app.route('/delete_favorite', methods=['POST'])
def delete_favorite():
    if not session.get('user_id'):
        return redirect(url_for('error', msg='無効なアクセスです。ログインしてください'))
    data = request.json
    title = data.get('title')

    if title:
        user_id = session['user_id']
        cur.execute("DELETE FROM likebooks WHERE user_id = %s AND title = %s", (user_id, title))
        db.commit()
        return jsonify({"message": f"『{title}』を削除しました。"})
    else:
        return jsonify({"message": "削除する本のタイトルが指定されていません。"}), 400


if __name__ == '__main__':
    
    cur=db.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS likebooks(
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        authors VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        summary VARCHAR(10000) NOT NULL
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS book_search_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        query VARCHAR(255) NOT NULL,
        start_index INT NOT NULL,
        max_results INT NOT NULL,
        result JSON NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_query (query, start_index, max_results)
    )
    """)
    db.commit()
    

    app.run(debug=True)
