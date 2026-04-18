from flask import Flask, render_template, request, jsonify
import mysql.connector

app = Flask(__name__)

def conectar_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",          # senha padrão do XAMPP é vazia
        database="meu_projeto_db"
    )

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para a página de checkout
@app.route('/checkout')
def checkout():
    return render_template('checkout.html')

# Rota para salvar o pedido no banco
@app.route('/finalizar-compra', methods=['POST'])
def finalizar_compra():
    dados = request.json

    try:
        conexao = conectar_db()
        cursor = conexao.cursor()

        sql = """
            INSERT INTO pedidos (
                nome, cpf, email, telefone,
                cep, logradouro, numero, complemento,
                bairro, cidade, uf
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        valores = (
            dados["nome"],
            dados["cpf"],
            dados["email"],
            dados["telefone"],
            dados["cep"],
            dados["logradouro"],
            dados["numero"],
            dados.get("complemento"),
            dados["bairro"],
            dados["cidade"],
            dados["uf"]
        )

        cursor.execute(sql, valores)
        conexao.commit()
        return jsonify({"status": "sucesso"})

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)})

    finally:
        cursor.close()
        conexao.close()

if __name__ == '__main__':
    app.run(debug=True)