const path = require('path');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.resolve('public')));
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

var user="";

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

app.get('/student', (req, res) => {
    res.render("student/home",{user: user});
});
app.get('/faculty', (req, res) => {
    res.render("faculty/home",{user: user});
});
app.get('/parent', (req, res) => {
    res.render("parent/home",{user: user});
});
app.get('/admin', (req, res) => {
    res.render("admin/home",{user: user});
});
app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', (req, res) => {
    user = req.body['user-type'];
    if(user == "student"){
        res.redirect("/student");
    }
    else if(user == "faculty"){
        res.redirect("/faculty");
    }
    else if(user == "parent"){
        res.redirect("/parent");
    }
    else{
        res.redirect("/admin");
    }

});