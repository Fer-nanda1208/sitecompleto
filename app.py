import os
import requests
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

import requests

class SigiloPay:
    def __init__(self, public_key, secret_key):
        self.base_url = "https://app.sigilopay.com.br/api/v1"
        self.headers = {
            "x-public-key": public_key,
            "x-secret-key": secret_key,
            "Content-Type": "application/json"
        }

    def _post(self, endpoint, data):
        url = f"{self.base_url}/{endpoint}"
        try:
            response = requests.post(url, json=data, headers=self.headers)
            return response.json()
        except Exception as e:
            return {"error": str(e)}
        
    

# ─────────────────────────────────────────────
# CONFIGURAÇÃO — nunca coloque a chave direto no código.
# No terminal, antes de rodar:
#   Linux/Mac: export SIGILOPAY_KEY="sua_chave_aqui"
#   Windows:   set SIGILOPAY_KEY=sua_chave_aqui
# ─────────────────────────────────────────────
SIGILOPAY_KEY  = os.environ.get("SIGILOPAY_KEY", "COLOQUE_SUA_CHAVE_AQUI")
SIGILOPAY_BASE = "https://app.sigilopay.com.br/api/v1"


def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="meu_projeto_db"
    )


# ─────────────────────────────────────────────
# PÁGINAS
# ─────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/checkout')
def checkout():
    return render_template('checkout.html')


# ─────────────────────────────────────────────
# SALVA PEDIDO NO BANCO DE DADOS
# Chamado por ambos os botões (Pix e Cartão)
# ─────────────────────────────────────────────
@app.route('/gerar-pix', methods=['POST'])
def gerar_pix():
    dados = request.get_json()
    # Aqui vai a lógica que criamos da SigiloPay...
    # Exemplo de retorno esperado pelo seu JS:
    return jsonify({"codigo_pix": "00020126360014BR.GOV.BCB.PIX..."})

if __name__ == "__main__":
    app.run(debug=True)