// importation d'express
const express = require("express");

// importation de Router
const router = express.Router();

// importation du middleware de l'authentification
const auth = require("../middleware/auth");
// importation du middleware de configuration de multer
const multer = require("../middleware/multer-config");

// importation des contrôleurs sauces
const saucesCtrl = require("../controllers/sauces");

// routes à utilisée pour chaque requête avec leurs fonctions
router.get("/",auth, saucesCtrl.getSauce);
router.post("/",auth, multer, saucesCtrl.createSauce);
router.post("/:id/like", auth, saucesCtrl.likeSauce );
router.get("/:id",auth, saucesCtrl.getOneSauce);
router.put("/:id",auth, multer, saucesCtrl.modifySauce);
router.delete("/:id",auth, saucesCtrl.deleteSauce);


// exportation de router
module.exports = router;