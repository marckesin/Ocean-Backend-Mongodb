require("dotenv").config(); // Necessário para as variáveis de ambiente
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const logger = require("morgan");
// const dbConfig = require('./config/database.config.js'); // Banco de dados local

const porta = process.env.PORT || 3000;
const url = process.env.DATABASE_URI;
const dbName = process.env.DBNAME;

const app = express();

app.use(logger("dev"));
app.use(express.json());

async function main() {
  // Conexão Banco de Dados
  const client = await MongoClient.connect(url);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("herois");

  app.get("/", function (req, res) {
    res.send("Página principal");
  });

  // [GET] - Lista todos os itens
  app.get("/herois", async function (req, res) {
    const documentos = await collection.find().toArray();

    res.send(documentos);
  });

  // Operações CRUD

  //  [GET] - Buscar por ID
  app.get("/herois/:id", async function (req, res) {
    const id = req.params.id;

    try {
      await collection.findOne({ _id: new ObjectId(id) }, (err, result) => {
        if (!err, result) {
          res.send(result);
        } else {
          res.send("Herói não encontrado.");
        }
      });
    } catch (err) {
      console.error(`Erro: ${err}`);
      res.redirect("/")
    }

  });

  // [POST] - Criar registro
  app.post("/herois", async function (req, res) {
    const item = req.body;

    await collection.insertOne(item);

    res.send(item);
  });

  // [PUT] - Alterar registro
  app.put("/herois/:id", async function (req, res) {
    const id = req.params.id;
    const item = req.body;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: item });

    res.send(item);
  });

  // [DELETE] - Deleta um item da lista
  app.delete("/herois/:id", async function (req, res) {
    const id = req.params.id;
    const heroi = await collection.findOne({ _id: new ObjectId(id) });

    await collection.deleteOne({ _id: new ObjectId(id) });

    res.send(`Herói removido: ${heroi.nome}`);
  });

  app.listen(porta, () => `Server rodando na porta ${porta}.`);
}

main();