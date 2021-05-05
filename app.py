from flask import Flask
from flask import render_template
from flask import request

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/verifier/', methods=['POST'])
def verifier():
	mdp = request.form['mdp']
	if mdp == "facile":
		return "Bien joué ! Tu en auras besoin pour la suite de ta quête : 347267376736734460654388230. A bientôt !"
	else:
		return "C'est pas si facile"