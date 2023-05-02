const path = require('path');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const sessionstorage = require('sessionstorage');
const mysql = require('mysql');

const db  = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'smartattendance'
});
db.connect((err) => {
    if(err) throw err;
    console.log('MySql Connected...');
});


app.set("view engine", "ejs");
app.use(express.static(path.resolve('public')));
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});


app.get('/student', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("student/home",{user: 'Hi'});
});
app.get('/faculty', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("faculty/home",{user: user});
});
app.get('/parent', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("parent/home",{user: user});
});
app.get('/admin', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("admin/home",{user: user});
});
app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', (req, res) => {
    var user = req.body['user-type'];
    if(user == "student"){
        let sql = 'SELECT * FROM student WHERE roll_no = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", req.body.username);
                res.redirect("/student");
            }
            else{
                res.redirect("/login");
            }
        });
    }
    else if(user == "faculty"){
        let sql = 'SELECT * FROM faculty WHERE faculty_id = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", req.body.username);
                res.redirect("/faculty");
            }
            else{
                res.redirect("/login");
            }
        });
    }
    else if(user == "parent"){
        let sql = 'SELECT * FROM student WHERE child_roll_no = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", req.body.username);
                res.redirect("/parent");
            }
            else{
                res.redirect("/login");
            }
        });
    }
    else{
        let sql = 'SELECT * FROM student WHERE admin_id = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", req.body.username);
                res.redirect("/admin");
            }
            else{
                res.redirect("/login");
            }
        });
    }

});