// importation d'express
const express = require("express");

// importation de dotenv
const dotenv = require("dotenv");
dotenv.config();

// importation de monngoose
const mongoose = require("mongoose");

// importation des routes sauces
const saucesRoutes = require("./routes/sauces");
// importation des routes utilisateurs
const userRoutes = require("./routes/user")

// importation de path
const path = require("path");

// importation d'express
const app = express();

// utilisation de json() pour les requêtes (req.body)
app.use(express.json());

// connexion avec la base de donnée mangoAtlas
mongoose.connect(`mongodb+srv://${process.env.MANGO_DB_USERNAME}:${process.env.MANGO_DB_PASSWORD}/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.erreur("Connexion à MongoDB échouée !"));

// ajouts des headers pour autorisé la connexion entre des serveurs http different pour l'utilisation de l'API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// appel des routes utilisée dans l'application
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

// exportation de app
module.exports = app;