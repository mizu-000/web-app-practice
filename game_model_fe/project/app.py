from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/js/<path:filename>')
def static_js(filename):
    return send_from_directory('static/js', filename, mimetype='application/javascript')

if __name__ == '__main__':
    app.run(debug=True)
