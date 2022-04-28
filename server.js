/* 
* **********************************
*
* CREATOR OF THIS SERVER: Danish Sharma
*
* **********************************
*/

// dotenv configuration
const dotenv = require("dotenv");
dotenv.config();

// Users Mongoose Data (users.js uses dotenv, so thats why dotenv is on top)
const usersDB = require("./users");

// Express
const express = require("express");
const app = express();

// Clarifai API
const clarifaiAPI = require("./clarifaiAPI");


// Cross-Origin Resource Sharing
const cors = require("cors");
app.use(cors());

// JSON parse
app.use(express.json());


// Http Port 
const HTTP_PORT = process.env.PORT || 8080;
const onHttpStart = () => {
    console.log(`Server listening on port : ${HTTP_PORT}`);
}; 

// ************* Routes **************

// GET - Home or /
app.get("/", (req,res) => {
    usersDB.getAllUsers()
        .then(users => {
            res.json({message: "API is listening . . . ", users: users});
        })
        .catch(err => res.status(422).json({ message: "fail", reply: err }));
});

// POST - login
app.post("/login", (req, res) => {
    usersDB.login(req.body)
        .then(user => {
            res.json({ message: "success", user: user });
        })
        .catch(err => res.status(422).json({ message: "fail", reply: err })); 
}); 

// POST - signup
app.post("/signup", (req, res) => {  
    usersDB.signUpUser(req.body)
        .then(result => {
            res.json({ message: "success", reply: result });
        })
        .catch(err => res.status(422).json({ message: "fail", reply: err }));
}); 

// PUT - image
app.put("/image", (req, res) => {
    usersDB.handleImage(req, res);
});  

// POST - image
app.post("/imageurl", (req, res) => {
    clarifaiAPI.handleApiCall(req, res);
});

// GET - profile params id
app.get("/profile/:id", (req, res) => {
    usersDB.profile(req.params.id)
        .then(user => {
            res.json({ message: "success", user: user });
        })
        .catch(err => res.status(400).json({ message: "fail", reply: err }));
});

// PUT - profile
app.put("/profile/update/:id", (req, res) => {
    usersDB.updateUser(req.params.id, req.body)
        .then(user => {
            res.json({ message: "success", user: user });
        })
        .catch(err => res.status(400).json({ message: "fail", reply: err }));
});

// Delete - profile
app.delete("/profile/delete/:id", (req, res) => {
    usersDB.deleteUser(req.params.id)
        .then(user => {
            res.json({ message: "success", user: user });
        })
        .catch(err => res.status(400).json({ message: "fail", reply: err }));
});




// Initializing the connection and Listening
usersDB.connect()
    .then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch((err) => {
        console.log("unable to start the server . . .");
        process.exit();
    });
