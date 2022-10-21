// importation de mongoose
const mongoose = require("mongoose");

// utilisation du package Schema de mongoose pour crée le schema de l'objet 
// création du type de donnée et de l'obligation pour chaques clés
const sauceSchema = mongoose.Schema ({
    userId: {type: String, required: true},
    name: {type: String, required: true},
    manufacturer: {type: String, required: true},
    description: {type: String, required: true},
    mainPepper: {type: String, required: true},
    imageUrl:{type: String, required: true},
    heat: {type: Number, required: true},
    likes: {type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    usersLiked: { type: [String] , required: true},
    usersDisliked: { type: [String], required: true}
});

// exportation du model sauceSchema
module.exports = mongoose.model("Sauce", sauceSchema);