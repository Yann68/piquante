// importation du model sauce
const Sauce = require("../models/Sauce");

//importation de fs 
const fs = require("fs");

// création d'un objet par un utilisateur qui sera envoyé dans la base de donnée 
exports.createSauce = (req, res) => {
    // l'utilisateur crée un objet
    // on supprime l'userId pour le récupéré par le token d'identification
    // on créé le chemin de l'image 
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    });
    // on sauvegarde dans la base de donnée
    sauce.save()
        .then(() => { res.status(201).json({ message: " recorded sauce !" }) })
        .catch(error => { res.status(500).json({ error }) })
};

// modification d'un objet par l'utilisateur qui a crée cet objet
exports.modifySauce = (req, res) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // si l'userId de l'utilisateur correspond pas avec l'userId du créateur on envois un message d'erreur
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: " unauthorized request !" });
            } else {
                // sinon on modifie l'objet dans la base de donnée 
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => { res.status(200).json({ message: "modified sauce !" }) })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

// suppression d'un objet par l'utilisateur qui a crée cet objet
exports.deleteSauce = (req, res) => {
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // si l'userId de l'utilisateur correspond pas avec l'userId du créateur on envois un message d'erreur
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: " unauthorized request ! " });
            } else {
                // sinon on supprime l'objet ainsi que l'image de l'objet dans le dossier images du systéme
                // on recrée le parcours pour récupérer l'URL de l'image 
                // on supprime l'image du systéme de fichier 
                // on supprime l'objet de la base de donnée 
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: " sauce removed !" }) })
                        .catch(error => res.status(500).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// récupérer un objet en particulier dans la base de donnée
exports.getOneSauce = (req, res) => {
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => { res.status(200).json(sauce) })
        .catch(error => res.status(404).json({ error }));
};

// récupérer tous les objets dans la base de donnée 
exports.getSauce = (req, res) => {
    Sauce.find()
        .then(sauces => { res.status(200).json(sauces) })
        .catch(error => res.status(404).json({ error }));
};

// ajout ou suppression des likes et dislikes dans la base de donnée
exports.likeSauce = (req, res) => {
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // l'utilisateur ajoute un like
            // on compare les Id 
            // on vérifie si l'utilisateur est pas encore dans le tableau usersLiked 
            // si il est pas dans le tableau et qu'il ajoute un like
            // on l'enregistre dans le tableau usersLiked et on rajoute +1 like
            if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id },
                    // $inc va modifier la valeur ou recreer la clé avec la valeur
                    // $push va envoyer l' userId dans le tableau usersLiked
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: " likes and userId added !" }))
                    .catch(error => res.status(500).json({ error }));
            }

            // l'utilisateur retire un like            
            // on verifie si l'utilisateur est retrouvé dans le tableau usersLiked
            // si il est dans le tableau et qui deduit un like 
            // on le supprime du tableau usersLiked et on deduit -1 like
            if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id },
                    // $pull va supprimé l'userId dans le tableau usersLiked
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: " like and userId deleted ! " }))
                    .catch(error => res.status(500).json({ error }));
            }

            // l'utilisateur ajoute un dislike
            // on verifie si l'utilisateur est retrouvé dans le tableau usersDisliked
            // si il est pas dans le tableau et qu'il ajoute un dislike
            // on l'enregistre dans le tableau usersDisliked et on rajoute +1 dislike
            if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
                Sauce.updateOne({ _id: req.params.id },
                    // $inc va modifier la valeur ou recreer la clé avec la valeur
                    // $push va envoyer l' userId dans le tableau usersDisliked
                    {
                        $inc: { dislikes: 1 },
                        $push: { usersDisliked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: " dislike and userId added ! " }))
                    .catch(error => res.status(500).json({ error }));
            }

            // l'utilisateur retire un dislike
            // on verifie si l'utilisateur est retrouvé dans le tableau usersDisliked
            // si il est dans le tableau et qu'il deduit un dislike
            // on le supprime dans le tableau usersDisliked et on deduit -1 dislike
            if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id },
                    // $pull va supprimé l'userId dans le tableau usersDisliked
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: " dislike and userId deleted ! " }))
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(404).json({ error }));
};
