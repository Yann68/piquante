// importation de bcrypt pour haché le mot de passe
const bcrypt = require("bcrypt");

// importation du modele utilisateur
const User = require("../models/User");

// importation de jsonwebtoken pour crypté 
const jwt = require("jsonwebtoken");


// hachage du mot de passe en utilisant bcrypt en créant un nouvel utilisateur qui sera envoyé a la base de donnée avec le password haché
exports.signup = (req, res) => {
   
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: " user created !" }))
                .catch(() => res.status(400).json({ error: "email existing" }))
        })
        .catch(error => res.status(500).json({ error }));
}



// vérification si l'utilisateur est déja inscrit en regardant l'email dans le corps body 
// si l'utilisateur existe pas dans la base de donnéé on retourne une reponse d'erreur
// si il existe on compare avec bcrypt le MDP transmit avec le MDP enregistré dans la base de donnéé
// si le MDP correspond pas on retoure une reponse d'erreur
// si le MDP correspond avec la base de donnée on connecte l'utilisateur
exports.login = (req, res) => {

    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: " incorrect password !" });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(404).json({ message: " user not found !" })
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            "RANDOM_TOKEN_SECRET",
                            { expiresIn: "24h" }
                        )
                    });

                })
                .catch(error => res.status(500).json({ error }));
        })

        .catch(error => res.status(500).json({ error }));
};