// importation de mongoose
const mongoose = require("mongoose");

// importation de mongoose-unique-validator
const uniqueValidator = require("mongoose-unique-validator");

// utilisation du package Schema de mongoose pour crée le schema de l'authentification
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true}
});

// activation de uniqueValidator pour userSchema
userSchema.plugin(uniqueValidator);

// exportation du model userSchema
module.exports = mongoose.model("User", userSchema);