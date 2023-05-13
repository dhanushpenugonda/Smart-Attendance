const path = require('path');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const sessionstorage = require('sessionstorage');
const mysql = require('mysql');

//  -----------------------------Date operations--------------------------------------------------------
function date_time(){
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();

    var date = year + "-" + month + "-" + day;
    // console.log(date);

    var hours = ("0" + (date_ob.getHours())).slice(-2);
    var minutes = ("0" + (date_ob.getMinutes())).slice(-2);
    var seconds = ("0" + (date_ob.getSeconds())).slice(-2);;

    var dateTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return dateTime;
}
// console.log(dateTime);

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

//  ----------------------------------SQL Connection---------------------------------------------------------

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


// let sql = 'SELECT * FROM student_attendance WHERE roll_no = "CB.EN.U4CSE20216"';
// let query = db.query(sql, (err, result) => {
//     if(err) throw err;
//     for(i in result){
//         console.log(result[i].date_time.split(" ")[0]);
//     }
//     var count = 0;
//     for(i in result){
//         if(result[i].status == "Present") count++;
//     }
//     console.log(count);
// });

// let dateTime = date_time();
// sql = 'INSERT INTO `attendance`(`course_id`, `date_time`, `slot`, `exp_time`) VALUES ("B.Tech..2020.R.CSE.3.19CSE313","'+dateTime+'","7","10")';
// query = db.query(sql, (err, result) => {
//     if(err) throw err;
//     // console.log(result);
// });

// sql = "SELECT roll_no FROM `coursetostudent` WHERE course_id = 'B.Tech..2020.R.CSE.3.19CSE314'";
// query = db.query(sql, (err, result) => {
//     if(err) throw err;
//     // console.log(result);
//     for(i in result){
//         sql1 = "INSERT INTO `student_attendance`(`roll_no`, `course_id`, `date_time`, `status`) VALUES ('"+result[i].roll_no+"','B.Tech..2020.R.CSE.3.19CSE313','"+dateTime+"','Present')";
//         query1 = db.query(sql1, (err, result) => {
//             if(err) throw err;
//             // console.log(result);
//         });
//     }
// });





// --------------------------------------Student--------------------------------------------------------
app.get('/student', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("student/home",{user: user});
});

app.get('/student/attendance', (req, res) => {
    // let user = sessionstorage.getItem("user");
    // let username = sessionstorage.getItem("username");
    let user = "Dhanush Penugonda";
    let username = "CB.EN.U4CSE20216";
    let sql = 'SELECT course.course_id, course.course_name, faculty.name FROM coursetostudent, course, faculty WHERE course.course_id = coursetostudent.course_id and course.faculty_id = faculty.faculty_id and coursetostudent.roll_no = "'+username+'"';
    let query = db.query(sql, async (err, result) => { 
        let courses = [];
        if(err) throw err;
        // console.log(result.length);
        for(let i = 0; i < result.length; i++){
            let sql1 = 'SELECT * FROM student_attendance WHERE roll_no = "'+username+'" and course_id = "'+result[i].course_id+'";';
            let query1 = db.query(sql1, (err,res) => {
                if(err) throw err;
                // console.log(res);
                let total = res.length;
                let present = 0;
                for(j in res){
                    if(res[j].status == "Present") present++;
                }
                // console.log(result[i],i);
                var obj = {
                    url: '/student/report/'+result[i].course_id,
                    course_name: result[i].course_name,
                    name: result[i].name,
                    total: total,
                    percentage: total ? present/total*100 : 100
                }
                courses.push(obj);
            });
        }
        while(courses.length < result.length) await sleep(1000);
        // console.log(courses);
        res.render("student/attendance",{user: user, courses: courses});
    });
});
app.get("/student/report/:course_id", (req,res) =>{
    // let user = sessionstorage.getItem("user");
    // let username = sessionstorage.getItem("username");
    let user = "Dhanush Penugonda";
    let username = "CB.EN.U4CSE20216";
    console.log(req.params.course_id);
    let sql = 'SELECT * FROM student_attendance,attendance WHERE attendance.date_time = student_attendance.date_time and attendance.course_id = student_attendance.course_id and student_attendance.roll_no = "'+username+'" and student_attendance.course_id = "'+req.params.course_id+'";';
    let query = db.query(sql, (err,result) => {
        console.log(result);
        res.render("student/report",{result: result});
    });
});

// --------------------------------------Faculty--------------------------------------------------------
app.get('/faculty', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("faculty/home",{user: user});
});

// --------------------------------------Parent---------------------------------------------------------
app.get('/parent', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("parent/home",{user: user});
});

// --------------------------------------Admin----------------------------------------------------------
app.get('/admin', (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("admin/home",{user: user});
});

// --------------------------------------Login-----------------------------------------------------------
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
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].roll_no);
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
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].roll_no);
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
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].roll_no);
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
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].roll_no);
                res.redirect("/admin");
            }
            else{
                res.redirect("/login");
            }
        });
    }

});