const User = require('../models/users')
const fs= require('fs')

const authentification = require('../middlewares/authentification')

const { Router ,static} = require('express')
const userRouter = new Router()

const bodyParser = require('body-parser')
const morgan = require('morgan')
const { results } = require('../utils/helper')
const multer = require('multer')

//config multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./data/files/pictures");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

const upload = multer({
    storage: storage,
}).single("picture");



userRouter.use(bodyParser.json())
    .use(morgan('dev'))
    .use(static('data'))

//ajout un étudiant
userRouter.post('/app/user', upload, async (req, res,next) => {
    const nameFile='';
    if(req.file){
        nameFile="/pictures/"+req.file.filename
    }

    const userAdd = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        pictures: nameFile
    })
    try {
        await userAdd.save()
        const authToken = await userAdd.generateAuthTokenAndSave()
        const message = `Ajout de utilisateur réussit`
        res.json(results(message, { userAdd, authToken }))
        res.status(201)
    } catch (e) {
        const message = "Echec utilisateur étudiant! "
        res.json(results(message, e))
        res.status(401)
    }
})

//Affiche tous étudiants
userRouter.get('/app/user', async (req, res) => {
    try {
        const allUser = await User.find({})
        const message = `La liste des ${allUser.length} utilisateur(s) a été bien envoyer! `
        res.json(results(message, allUser))
    } catch (e) {
        const message = 'Echec affichage liste des utilisateurs!'
        res.json(results(message, e))
        res.status(501)
    }
})

//affiche profil étudiant connecté
userRouter.get('/app/user/me', authentification, async (req, res) => {
    try {
        const userConnected = req.user;
        const message = `Le profil de ${userConnected.name} a été bien envoyer! `
        res.json(results(message, userConnected))
    } catch (e) {
        const message = 'Echec affichage profile étudiant!'
        res.json(results(message, console.error(e)))
        res.status(501)
    }
})

//Affiche un étudiant
userRouter.get('/app/user/:id', async (req, res, next) => {
    const userID = req.params.id;

    try {
        const userFind = await User.findById(userID);
        if (!userFind) {
            const message = 'Aucun utilisateur de cette identifiant trouvé dans la base de données!'
            res.status(404)
            res.json(results(message, userFind))

        }
        else {
            const message = `L'utilisateur  a été bien trouvé `
            res.json(results(message, studentFind))
        }

    } catch (e) {
        const message = "Erreur lors du recherche de l'utilisateur!"
        res.json(results(message, console.error(e)))
        res.status(501);
    }
})

//Modification d'un étudiant
userRouter.put('/app/user/:id', upload,async (req, res,next) => {
    const updateInfo = Object.keys(req.body)
    const userId = req.params.id;
    let newPicture=''
    
    try {
        const userUpdate = await User.findById(userId)
        if (!userUpdate) {
            res.json(results('Aucun utilisateur de cette identifiant a été trouvé!', {}))
            res.status(404)
        }

        if(req.file){
            newPicture= req.file.filename;
            try {
                fs.unlinkSync("../data/files/pictures/"+req.body.oldPicture)
            } catch (e) {
                console.log(e);
            }
        }
        else{
            newPicture= req.body.oldPicture;
        }

        updateInfo.forEach((update) =>{
            userUpdate[update] = req.body[update]
        })

        userUpdate.picture= newPicture

        await userUpdate.save();

        const message = `L'utilisateur a été bien mis à jour!`
        res.json(results(message, userUpdate))
    } catch (err) {
        const message = "Echec du mis à jour de l'utilisateur"
        console.error(err);
        res.json(results(message, err))
    }
})


//suppression d'un utilisateur
userRouter.delete('/app/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const userDeleted = await User.findByIdAndDelete(userId)
        if (!userDeleted) {
            const message = "L'utilisateur que vous voulez supprimmer n'existe pas!"
            res.json(results(message, userDeleted))
            res.status(404)
        }

        const message = `L'utilisateur a été bien supprimmer!`
        res.json(results(message, studentDeleted))
    } catch (e) {
        const message = "Echec du suppression de l'utilisateur"
        res.json(results(message, e))
    }
})


//connexion
userRouter.post('/app/login', async (req, res) => {
    //se connecter avec num_matricule et mot de passe
    try {
        const user = await User.findLogin(req.body.email, req.body.password);
        const authToken = await user.generateAuthTokenAndSave()
        req.authToken = authToken
        const message = `L'utilisateur ${user.name}  est maintenant connecté!`

        res.json(results(message, { user, authToken }))
    } catch (e) {
        res.json(results('Erreur login', console.error(e)))
        res.status(404).send()
    }

})

//déconnexion
userRouter.post('/app/user/logout', authentification, async (req, res) => {
    try {
        req.user.authTokens = req.user.authTokens.filter((objToken) => {
            return objToken.authToken !== req.authToken;
        })

        await req.user.save()

        const message = "L'utilisateur a été bien déconnecté!"
        res.json(results(message, {}))
    } catch (e) {
        res.json(results('Erreur logout', e))
        res.status(404).send()
    }
})


//déconnexion all
userRouter.post('/app/user/logoutAll', authentification, async (req, res) => {
    try {
        while(req.user.authTokens.length!==0)
        {
            req.user.authTokens.pop()    
        }

        await req.user.save()

        const message = "L'utilisateur a été bien déconnecté tout session!"
        res.json(results(message, {}))
    } catch (e) {
        res.json(results('Erreur logout all', console.error(e)))
        res.status(404).send()
    }
})
module.exports = userRouter    