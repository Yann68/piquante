// importation de jsonwebtoken
const jwt = require("jsonwebtoken");

// utilisation de split pour crée un tableau autour de l'espace pour récupéré le token qui se trouve en 2éme place apres bearer
// on utilise verify pour décodé le token
// on extrait l'userId du token pour l'utilisé sur toutes les routes
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};