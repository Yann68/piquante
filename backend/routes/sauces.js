// importation d'express
const express = require("express");

// importation de Router
const router = express.Router();

// importation du middleware de l'authentification
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

// importation des contrôleurs sauces
const saucesCtrl = require("../controllers/sauces");

// routes à utilisée pour chaque requête avec leurs fonctions
router.get("/",auth, saucesCtrl.getThing);
router.post("/",auth, multer, saucesCtrl.createThing);
router.post("/:id/like", auth, saucesCtrl.likeThing );
router.get("/:id",auth, saucesCtrl.getOneThing);
router.put("/:id",auth, multer, saucesCtrl.modifyThing);
router.delete("/:id",auth, saucesCtrl.deleteThing);


// exportation de router
module.exports = router;