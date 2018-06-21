var User = require('../models/user-model');
const jwt = require('jsonwebtoken');
var bCrypt = require('bcrypt-nodejs');


module.exports = {

    login: function (req, res) {

        var username = req.body.username;
        var password = req.body.password;

        // usually this would be a database call:
        User.findOne({username: username})
        .then(user => {

            if(!user){
                return res.status(401).json({message:"Invalid username"});
            }
            if(typeof password == 'undefined' || !isValidPassword(user, password)) {
                return res.status(401).json({message:"Invalid password"});
            }
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = {id: user._id};
            var token = jwt.sign(payload, 'secretDSIAccounts');
            res.json({message: "success", accessToken: token});
        });
      
    },

    create: function (req, res) {

        // Validate request
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send({
                message: "User body cannot be empty"
            });
        }
        var newUser = new User(req.body);
        if(typeof req.body.password !== 'undefined') newUser.password = createHash(newUser.password);
    
		// save the user
		newUser.save(function(err, user) {
			if (err){
				return res.status(500).send({
                    message: err.message || "Some error occurred while creating the User"});
			}
			res.send(user);
		});
    },

    getAll: function (req, res) {

        User.find()
        .then(Users => {
            res.send(Users);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        });
        
    },

    update: function (req, res) {

        // Validate Request
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send({
                message: "User body can not be empty"
            });
        }
        if(req.body.password) {
            req.body.password = createHash(req.body.password);
        }
        // Find User and update it with the request body
        User.findOneAndUpdate({username: req.params.userName}, req.body, {new: true})
        .then(user => {
            if(!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userName
                });            
            }
            res.send(user);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userName
                });                
            }
            return res.status(500).send({
                message: "Error updating User with id " + req.params.userName
            });
        });

    },

    get: function (req, res) {

        User.findOne({username: req.params.userName})
        .then(user => {
            if(!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userName
                });            
            }
            res.send(user);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userName
                });                
            }
            return res.status(500).send({
                message: "Error retrieving User with id " + req.params.userName
            });
        });
    },

    delete: function (req, res) {

        User.findOneAndRemove({username: req.params.userName})
        .then(user => {
            if(!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userName
                });
            }
            res.send({message: "User deleted successfully!"});
        }).catch(err => {
            if(err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userName
                });                
            }
            return res.status(500).send({
                message: "Could not delete User with id " + req.params.userName
            });
        });

    }

};

var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
};
// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};