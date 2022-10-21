// importation d'express
const express = require("express");

// importation de Router
const router = express.Router();

// importation des controleurs utilisateur
const userCtrl = require("../controllers/user");

// routes à utilisée pour chaque requête avec leurs fonctions
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

// exportation de router
module.exports = router;