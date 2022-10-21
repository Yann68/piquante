// importation de multer
const multer = require("multer");

// tableau des formats d'images 
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png"
};

// création d'un objet de configuration pour multer
// on utilise multer.diskStorage pour enregistré sur le disque
// on indique la destination pour l'enregistrement de l'image
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  // création d'un nouveau nom de l'image 
  filename: (req, file, callback) => {
    // on élimine les espaces du nom original de l'image
    const name = file.originalname.split(" ").join("_");
    // on crée le nouveau nom de l'image
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  }
});

module.exports = multer({storage: storage}).single("image");