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
app.get('/student', async (req, res) => {
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    let  courses = [];
    let sql = 'SELECT course_id FROM coursetostudent WHERE roll_no = "'+username+'"';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        courses = result;
    });
    while(courses.length == 0) await sleep(1000);
    sql = 'SELECT * FROM student_attendance WHERE roll_no = "'+username+'"';
    query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        var present = 0, absent = 0;
        for(var i = 0; i < result.length; i++) {
            if(result[i].status == "Present") present++;
            if(result[i].status == "Absent") absent++;
        }
        res.render("student/home",{user: user, present: present, absent: absent, courses: courses});
    });

});

app.get('/student/attendance', (req, res) => {
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
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
        var total = 0;
        var boo = true;
        var present = 0, absent = 0;
        sql1 = 'SELECT * FROM student_attendance WHERE roll_no = "'+username+'"';
        query1 = db.query(sql1, async (err, res) => {
            if(err) throw err;
            // console.log(res);
            total = res.length;
            for(var i = 0; i < res.length; i++) {
                if(res[i].status == "Present") present++;
                if(res[i].status == "Absent") absent++;
            }
            boo = false
        });
        while(boo) await sleep(1000);
        res.render("student/attendance",{user: user, courses: courses, total: total, present: present, absent: absent});
    });
});
app.get("/student/report/:course_id", (req,res) =>{
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    // let user = "Dhanush Penugonda";
    // let username = "CB.EN.U4CSE20216";
    // console.log(req.params.course_id);
    let sql = 'SELECT * FROM student_attendance,attendance WHERE attendance.date_time = student_attendance.date_time and attendance.course_id = student_attendance.course_id and student_attendance.roll_no = "'+username+'" and student_attendance.course_id = "'+req.params.course_id+'";';
    let query = db.query(sql, (err,result) => {
        // console.log(result);
        res.render("student/report",{result: result});
    });
});

// --------------------------------------Faculty--------------------------------------------------------
app.get('/faculty', (req, res) => {
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    // let user = "Radhika N";
    // let username = "n_radhika";
    let courses = []
    let sql = 'SELECT * FROM course WHERE faculty_id = "'+username+'"';
    let query = db.query(sql, async (err,result) => {
        if(err) throw err;
        // console.log(result);
        let courses = [];
        for(var i = 0; i < result.length; i++){
            let students = -1;
            let sql1 = 'SELECT * FROM coursetostudent WHERE course_id = "'+result[i].course_id+'"';
            let query1 = db.query(sql1, (err, res) => {
                if(err) throw err;
                // console.log(res.length);
                students = res.length;
            });
            let hours_left = -1;
            sql1 = 'SELECT * FROM attendance WHERE course_id = "'+result[i].course_id+'"';
            query1 = db.query(sql1, (err, res) => {
                if(err) throw err;
                // console.log(res.length);
                hours_left = res.length;
            });
            while(hours_left==-1 || students==-1) await sleep(1000);
            courses.push({
                url: '/faculty/'+result[i].course_id,
                course_id: result[i].course_id,
                course_name: result[i].course_name,
                students: students,
                hours_left: hours_left
            });

        }
        while(courses.length < result.length) await sleep(1000);
        console.log(courses)
        res.render("faculty/home",{user: user, courses: courses});
    });

});

app.get("/faculty/:course_id", async (req,res) => {
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    // let user = "Radhika N";
    // let username = "n_radhika";
    // console.log(req.params.course_id);
    let sql = 'SELECT * FROM attendance WHERE course_id = "'+req.params.course_id+'";';
    let query = db.query(sql, (err,result) => {
        // console.log(result);
        var final = [];
        for(var i=0; i<result.length; i++){
            final.push({
                url: "/faculty/"+req.params.course_id+"/"+result[0].slot+"/"+result[0].date_time.split(" ")[0],
                date_time: result[i].date_time,
                slot: result[i].slot
            });
        }
        res.render("faculty/attendances",{user: user, course_id: req.params.course_id, result: final});
    });
});


app.get("/faculty/:course_id/:slot/:date_time", (req,res) =>{
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    // let user = "Radhika N";
    // let username = "n_radhika";
    // console.log(req.params.course_id);
    let sql = 'SELECT student_attendance.roll_no, student_attendance.status FROM student_attendance, attendance WHERE  attendance.course_id = student_attendance.course_id and attendance.date_time = student_attendance.date_time and attendance.course_id = "'+req.params.course_id+'" and attendance.date_time REGEXP "'+req.params.date_time+' *" and attendance.slot = "'+req.params.slot+'";';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(result);
        res.render("faculty/students",{user: user, course_id: req.params.course_id,date_time: req.params.date_time, slot: req.params.slot, result: result});
    });
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
            // console.log(result);
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
                sessionstorage.setItem("username", result[0].faculty_id);
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