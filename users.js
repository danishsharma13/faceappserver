


const mongoose = require("mongoose"); 
mongoose.set('useFindAndModify', false);
const bcrypt = require("bcryptjs");

let mongooseConnectionString = process.env.MONGO_URL;

let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true, // throw an error if same email was passed in while signup
        required: true, 
    },
    email: {
        type: String,
        required: true, // will not work if the email isn't provided
        lowercase: true // Will save emails in lowercase
    },
    password: {
        type: String,
        required: true
    },
    entries: {
        type: Number,
        default: 0,
    },
    joined: {
        type: Date,
        immutable: true, // Cannot change the date
        default: () => Date.now(),
    }
});

let Users;

module.exports.connect = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(mongooseConnectionString, { 
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        db.on("error", err => {
            reject(err);
        });

        db.once("open", () => {
            Users = db.model("users", userSchema);
            resolve();
        });
    });
}

module.exports.getAllUsers = function () {
    return new Promise((resolve, reject) => {
        Users.find({})
        .exec()
        .then(usersData => {
            resolve(usersData);
        })
        .catch(err => reject("Couldn't find users data."));
    });
}

module.exports.signUpUser = function(userInfo) {
    return new Promise(function (resolve, reject) {
        bcrypt.hash(userInfo.password, 10)
            .then(hash => {
                userInfo.password = hash;

                let newUser = new Users(userInfo);

                newUser.save(err => {
                    if (err) {
                        if (err.code == 11000) {
                            reject("Email Already Exists");
                        }
                        else {
                            reject("There was an error creating new User, error: " + err);
                        }
                    }
                    
                    resolve("Successfully added to the database.");
                })
            })
            .catch(err => reject("Problem as hashing, error: " + err)); 
    });
};

module.exports.login = function(userInfo) {
    return new Promise(function (resolve, reject) {
        Users.findOne({ userName: userInfo.userName})
            .exec()
            .then(user => {
                bcrypt.compare(userInfo.password, user.password)
                .then(result => {
                        if(result == true) {
                            resolve(user);
                        }
                        else reject("Password incorrect!");
                    });

            })
            .catch(err => reject("Unable to find user"));    
    });
};

module.exports.profile = function(userId) {
    return new Promise((resolve, reject) => {
        Users.findOne({_id: userId})
            .exec()
            .then(user => resolve(user))
            .catch(err => reject("Couldn't find user with given ID"));
    });
};

module.exports.updateUser = function (userId, userInfo) {
    return new Promise((resolve, reject) => {
        Users.findById(userId)
            .exec()
            .then(user => {
                bcrypt.hash(userInfo.password, 10)
                    .then(hash => {
                        Users.findByIdAndUpdate(
                                userId, 
                                { name: userInfo.name, password: hash }, 
                                { new: true }
                            )
                            .exec()
                            .then(user => { 
                                resolve(user);
                            })
                            .catch(err => reject("Unable to update the user."));
                    })
                    .catch(err => reject("Problem as hashing, error: " + err));
            })
            .catch(err => reject("Unable to find the user."));
    });
};

module.exports.deleteUser = function (userId) {
    return new Promise((resolve, reject) => {
        Users.find({ _id: userId })
            .remove()
            .exec()
            .then(result => {
                if (result.deletedCount > 0) resolve({ _id: userId, deleteCount: result.deletedCount});
                else reject("User does not exist");
            })
            .catch(err => reject("Couldn't delete user."));
    });
};

// request and response for the server's image
module.exports.handleImage = (req, res) => {
    Users.findByIdAndUpdate(
            req.body._id, 
            { $inc: { entries: 1 } }, 
            { new: true }
        )
        .exec()
        .then(user => {
            res.json({ message: "success", user: user });
        })
        .catch(err => res.status(400).json({ message: "fail", reply: err }));
};



