require("dotenv").config(); // Necessário para as variáveis de ambiente
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const { body, param, validationResult } = require('express-validator');
// const dbConfig = require('./config/database.config.js'); // Banco de dados local

const porta = process.env.PORT || 3000;
const url = process.env.DATABASE_URI;
const dbName = process.env.DBNAME;

const app = express();

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
  app.get("/herois/:id",
    param('id').isMongoId(), // verifica se a string é uma representação de um MongoDB ObjectId 

    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = req.params.id;

      await collection.findOne({ _id: new ObjectId(id) }, (err, result) => {
        if (!err && result) {
          res.send(result);
        } else {
          res.send("Ítem não encontrado.");
        }
      });
    }
  );

  // [POST] - Criar registro
  app.post("/herois",
    body().isObject(), //valida se req.body é um object

    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const item = req.body;

      await collection.insertOne(item, (err, result) => {
        if (!err && result) {
          res.send(item);
        } else {
          res.send("Ítem não criado.");
        }
      });
    }
  );

  // [PUT] - Alterar registro
  app.put("/herois/:id",
    param("id").isMongoId(),
    body().isObject(),

    async function (req, res) {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = req.params.id;
      const item = req.body;

      await collection.updateOne({ _id: new ObjectId(id) }, { $set: item }, (err, result) => {
        if (!err && result.matchedCount) {
          res.send(item);
        } else {
          res.send("Ítem não encontrado.");
        }
      });
    }
  );

  // [DELETE] - Deleta um item da lista
  app.delete("/herois/:id",
    param("id").isMongoId(),

    async function (req, res) {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = req.params.id;

      await collection.deleteOne({ _id: new ObjectId(id) }, (err, result) => {
        if (!err && result.deletedCount) {
          res.send("Ítem excluido.");
        } else {
          res.send("Ítem não encontrado.");
        }
      });
    }
  );

  app.listen(porta, () => `Servidor rodando na porta ${porta}.`);
}

main();