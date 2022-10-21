// importation du fichier Thing du dossier Models
const Thing = require("../models/Thing");

//importation de fs qui permet d'interagir avec la base de donnée
const fs = require("fs");

// création d'un objet par un utilisateur qui sera envoyé dans la base de donnée 
exports.createThing = (req, res, next) => {
    // l'utilisateur crée un objet
    // on parse l'objet en chaine de caractére
    // on supprime l'userId pour le récupéré par le token d'identification
    // on créé un nouvel objet en utilisant le model du schema sauce avec l'userId supprimé
    // on récupére l'userId grace au middleware
    // on créé le chemein de l'image avec req.protocol pour récupéré le http, req.host pour récupéré localhost:3000 et req.file.filename pour l'URL de l'image
    const thingObject = JSON.parse(req.body.sauce);
    delete thingObject._userId;
    const thing = new Thing({
        ...thingObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    });
    // on sauvegarde dans la base de donnée
    thing.save()
        .then(() => { res.status(201).json({ message: "Objet enregistré !" }) })
        .catch(error => { res.status(400).json({ error }) })
};

// modification d'un objet par l'utilisateur qui a crée cet objet
exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };

    delete thingObject._userId;
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Thing.findOne({ _id: req.params.id })
        .then((thing) => {
            // si l'userId de l'utilisateur correspond pas avec l'userId du créateur on envois un message d'erreur
            if (thing.userId != req.auth.userId) {
                res.status(403).json({ message: "Non autorisé" });
            } else {
                // sinon on modifie l'objet dans la base de donnée 
                Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                    .then(() => { res.status(200).json({ message: "Objet modifié!" }) })
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// suppression d'un objet par l'utilisateur qui a crée cet objet
exports.deleteThing = (req, res, next) => {
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            // si l'userId de l'utilisateur correspond pas avec l'userId du créateur on envois un message d'erreur
            if (thing.userId != req.auth.userId) {
                res.status(403).json({ message: "Non autorisé " });
            } else {
                // sinon on supprime l'objet ainsi que l'image de l'objet dans le dossier images du systéme
                // on recrée le parcours pour récupérer l'URL de l'image avec split 
                // on supprime l'image du systéme de fichier avec fs.unlink en utilsant le chemin de l'image
                // on supprime l'objet de la base de donnée en comparant les id
                const filename = thing.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Thing.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: "Objet supprimé !" }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// récupérer un objet en particulier dans la base de donnée en utilisant findOne() en comparant _id de la base de donnéé avec l'id en parametre
exports.getOneThing = (req, res, next) => {
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Thing.findOne({ _id: req.params.id })
        .then(thing => { res.status(200).json(thing) })
        .catch(error => res.status(404).json({ error }));
};

// récupérer tous les objets dans la base de donnée en utilisant find()
exports.getThing = (req, res, next) => {
    Thing.find()
        .then(things => { res.status(200).json(things) })
        .catch(error => res.status(400).json({ error }));
};

// ajout ou suppression des likes et dislikes dans la base de donnée
exports.likeThing = (req, res, next) => {
    // on compare l'id de la base de donnée avec l'id de l'utilisateur 
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            // l'utilisateur ajoute un like
            // utilisation de findOne() pour comparé l'id 
            // on utilise include() null pour voir si l'utilisateur est pas encore dans le tableau usersLiked 
            // si il est pas dans le tableau et qu'il ajoute un like
            // on l'enregistre dans le tableau usersLiked et on rajoute +1 like
            if (!thing.usersLiked.includes(req.body.userId) && req.body.like === 1) {
                Thing.updateOne({ _id: req.params.id },
                    // $inc va modifier la valeur ou recreer la clé avec la valeur
                    // $push va envoyer l' userId dans le tableau usersLiked
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: "like et userId ajouté" }))
                    .catch(error => res.status(500).json({ error }));
            }

            // l'utilisateur retire un like            
            // on utilise include() pour voir si l'utilisateur est retrouvé dans le tableau usersLiked
            // si il est dans le tableau et qui deduit un like 
            // on le supprime du tableau usersLiked et on deduit -1 like
            if (thing.usersLiked.includes(req.body.userId) && req.body.like === 0) {
                Thing.updateOne({ _id: req.params.id },
                    // $pull va supprimé l'userId dans le tableau usersLiked
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: "like et userId supprimé" }))
                    .catch(error => res.status(400).json({ error }));
            }

            // l'utilisateur ajoute un dislike
            // on utilise include() null pour voir si l'utilisateur est retrouvé dans le tableau usersDisliked
            // si il est pas dans le tableau et qu'il ajoute un dislike
            // on l'enregistre dans le tableau usersDisliked et on rajoute +1 dislike
            if (!thing.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
                Thing.updateOne({ _id: req.params.id },
                    // $inc va modifier la valeur ou recreer la clé avec la valeur
                    // $push va envoyer l' userId dans le tableau usersDisliked
                    {
                        $inc: { dislikes: 1 },
                        $push: { usersDisliked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: "dislike et userId ajouté" }))
                    .catch(error => res.status(400).json({ error }));
            }

            // l'utilisateur retire un dislike
            // on utilise include() pour voir si l'utilisateur est retrouvé dans le tableau usersDisliked
            // si il est dans le tableau et qu'il deduit un dislike
            // on le supprime dans le tableau usersDisliked et on deduit -1 dislike
            if (thing.usersDisliked.includes(req.body.userId) && req.body.like === 0) {
                Thing.updateOne({ _id: req.params.id },
                    // $pull va supprimé l'userId dans le tableau usersDisliked
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.body.userId }
                    })
                    .then(() => res.status(201).json({ message: "dislike et userId supprimé" }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(404).json({ error }));
};
