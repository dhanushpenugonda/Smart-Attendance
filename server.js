const path = require('path');
const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const sessionstorage = require('sessionstorage');
const mysql = require('mysql');

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "testqwerty433@gmail.com",
        pass: "pmrvufjatfkosiwt"
    }
});




//  -----------------------------Date and Time operations--------------------------------------------------------
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

function addMinutes(time, minsToAdd) {
    function D(J){ return (J<10? '0':'') + J;};
    var piece = time.split(':');
    var mins = piece[0]*60 + +piece[1] + +minsToAdd;
  
    return D(mins%(24*60)/60 | 0) + ':' + D(mins%60) + ':' + piece[2];  
}  

function requireLogin(req, res, next) {
    if (sessionstorage.length == 0) {
      return res.redirect('/');
    }
    next();
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
    lat1 = parseFloat(lat1);
    lon1 = parseFloat(lon1);
    lat2 = parseFloat(lat2);
    lon2 = parseFloat(lon2);
    var R = 6378.137; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c * 1000; // Distance in m
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

//  ----------------------------------SQL Connection---------------------------------------------------------

const db  = mysql.createConnection({
    host : 'sql6.freesqldatabase.com',
    user : 'sql6637004',
    password : 'hJKCTwiyFf',
    database : 'sql6637004'
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
    console.log(`Example app listening on port ${port}`);
});

// --------------------------------------Login-----------------------------------------------------------

app.get('/', (req, res) => {
    res.render("login", {valid: false});
});

app.post('/', (req, res) => {
    var user = req.body['user-type'];
    // console.log(date_time());
    if(user == "student"){
        let sql = 'SELECT * FROM student WHERE roll_no = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            // console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].roll_no);
                sessionstorage.setItem("time", date_time());
                sessionstorage.setItem("message", "");
                sessionstorage.setItem("role", user);
                // console.log(sessionstorage.length);
                return res.redirect("/student");
            }
            else{
                return res.render("login", {valid: true});
            }
        });
    }
    else if(user == "faculty"){
        let sql = 'SELECT * FROM faculty WHERE faculty_id = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            // console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].faculty_id);
                sessionstorage.setItem("time", date_time());
                sessionstorage.setItem("message", "");
                sessionstorage.setItem("role", user);
                // console.log(sessionstorage.length);
                return res.redirect("/faculty");
            }
            else{
                return res.render("login", {valid: true});
            }
        });
    }
    else if(user == "parent"){
        let sql = 'SELECT * FROM parent WHERE child_roll_no = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            // console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].child_roll_no);
                sessionstorage.setItem("time", date_time());
                sessionstorage.setItem("message", "");
                sessionstorage.setItem("role", user);
                // console.log(sessionstorage.length);
                return res.redirect("/parent");
            }
            else{
                return res.render("login", {valid: true});
            }
        });
    }
    else{
        let sql = 'SELECT * FROM admin WHERE admin_id = "'+req.body.username+'" AND password = "'+req.body.password+'"';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            // console.log(result);
            if (result.length != 0){
                sessionstorage.setItem("user", result[0].name);
                sessionstorage.setItem("username", result[0].roll_no);
                sessionstorage.setItem("time", date_time());
                sessionstorage.setItem("message", "");
                sessionstorage.setItem("role", user);
                // console.log(sessionstorage.length);
                return res.redirect("/admin");
            }
            else{
                return res.render("login", {valid: true});
            }
        });
    }
    // res.redirect("/");

});


app.get('/logout', requireLogin, (req, res) => {    
    var currTime = date_time().split(" ")[1];
    var time = sessionstorage.getItem('time').split(" ")[1];
    var user = sessionstorage.getItem("role");
    console.log(currTime, addMinutes(time, 1));
    if(addMinutes(time, 1) < currTime || user != "student"){
        sessionstorage.clear();
        return res.redirect("/");
    }
    sessionstorage.setItem("message", "You can't logout before "+addMinutes(time, 1));
    return res.redirect("/student");
});

app.get('/forgot', (req, res) => {
    res.render("forgot", {message: ""});
});

app.post('/forgot', async (req, res) => {
    sessionstorage.setItem("username", req.body.username);
    sessionstorage.setItem("role", req.body.role);
    if(req.body.role == "Student"){
        let sql = "SELECT * FROM student WHERE roll_no = '"+req.body.username+"';";
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            if(result.length == 0){
                return res.render("forgot", {message: "Invalid Username"});
            }
        });
    }
    else if(req.body.role == "Faculty"){
        let sql = "SELECT * FROM faculty WHERE faculty_id = '"+req.body.username+"';";
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            if(result.length == 0){
                return res.render("forgot", {message: "Invalid Username"});
            }
        });
    }
    else{
        let sql = "SELECT * FROM parent WHERE child_roll_no = '"+req.body.username+"';";
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            if(result.length == 0){
                return res.render("forgot", {message: "Invalid Username"});
            }
        });
    }
    var email;
    if(req.body.role == "Faculty"){
        email = req.body.username.toLowerCase() + "@cb.amrita.edu";
    }
    else{
        email = req.body.username.toLowerCase() + "@cb.students.amrita.edu";
    }
    console.log(email);
    sessionstorage.setItem("email", email);
    let otp = Math.random();
    otp = otp * 10000;
    otp = parseInt(otp);
    // console.log(otp);
    sessionstorage.setItem("otp", otp.toString());
    const mailOptions = {
        from: "testqwerty433@gmail.com",
        to: email,
        subject: "OTP for your reset password request",
        html: '<h3>Your OTP to reset the password is </h3>' + '<h1>'+ otp +'</h1>'
    };
    var boo = true;
    transporter.sendMail(mailOptions, function(err, info){
        if(err) throw err;
        else{
            console.log("Email sent: " + info.response);
            boo = false;
        }
    });
    while(boo) await sleep(100);
    res.redirect('/otp');
});

app.get('/resend', async (req, res) => {
    sessionstorage.setItem("email", email);
    let otp = Math.random();
    otp = otp * 10000;
    otp = parseInt(otp);
    sessionstorage.setItem("otp", otp);
    const mailOptions = {
        from: "testqwerty433@gmail.com",
        to: email,
        subject: "OTP for your reset password request",
        html: '<h3>OTP for verification is </h3>' + '<h1>'+ otp +'</h1>'
    };
    var boo = true;
    transporter.sendMail(mailOptions, function(err, info){
        if(err) throw err;
        else{
            console.log("Email sent: " + info.response);
            boo = false;
        }
    });
    while(boo) await sleep(100);
    res.redirect('/otp');
});

app.get('/otp', (req, res) => {
    res.render("otp", {message: "OTP has been sent to "+sessionstorage.getItem("email")});
});


app.post('/otp', (req, res) => {
    if(req.body.otp == sessionstorage.getItem("otp")){
        sessionstorage.removeItem("otp");
        sessionstorage.removeItem("email");
        res.render("reset", {message: ""});
    }
    else{
        res.render("otp",{message: "Invalid OTP"});
    }
});

app.get('/reset', (req, res) => {
    res.render("reset", {message: ""});
});

app.post('/reset', (req, res) => {
    if(req.body.password == req.body['re-password']){
        if(sessionstorage.getItem("role") == "Student"){
            let sql = "UPDATE student SET password = '"+req.body.password+"' WHERE roll_no = '"+sessionstorage.getItem("username")+"';";
            let query = db.query(sql, (err, result) => {
                if(err) throw err;
                // console.log(result);
                sessionstorage.removeItem("username");
                sessionstorage.removeItem("role");
                res.redirect("/");
            });
        }
        else if(sessionstorage.getItem("role") == "Faculty"){
            let sql = "UPDATE faculty SET password = '"+req.body.password+"' WHERE faculty_id = '"+sessionstorage.getItem("username")+"';";
            let query = db.query(sql, (err, result) => {
                if(err) throw err;
                // console.log(result);
                sessionstorage.removeItem("username");
                sessionstorage.removeItem("role");
                res.redirect("/");
            });
        }
        else{
            let sql = "UPDATE parent SET password = '"+req.body.password+"' WHERE child_roll_no = '"+sessionstorage.getItem("username")+"';";
            let query = db.query(sql, (err, result) => {
                if(err) throw err;
                // console.log(result);
                sessionstorage.removeItem("username");
                sessionstorage.removeItem("role");
                res.redirect("/");
            });
        }
    }
    else{
        res.render("reset", {message: "Passwords don't match"});
    }
});

// app.get('/*', (req, res) => {
//     // if(req.url == "/") return res.redirect('/');
//     if(sessionstorage.length == 0) {
//         return res.redirect('/');
//     }
// });

// --------------------------------------Student--------------------------------------------------------
app.get('/student', requireLogin, async (req, res) => {
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    let  courses = [];
    let sql = 'SELECT course_id FROM coursetostudent WHERE roll_no = "'+username+'"';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        courses = result;
    });
    while(courses.length == 0) await sleep(100);
    sql = 'SELECT * FROM student_attendance WHERE roll_no = "'+username+'"';
    query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        var present = 0, absent = 0;
        for(var i = 0; i < result.length; i++) {
            if(result[i].status == "Present") present++;
            if(result[i].status == "Absent") absent++;
        }
        var message = sessionstorage.getItem("message");
        sessionstorage.setItem("message", "");
        res.render("student/home",{user: user, present: present, message: message, absent: absent, courses: courses});
    });

});

app.post("/student/portal", async (req, res) => {
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    var final = [];
    var boo = true;
    // console.log(req.body);
    let sql = 'SELECT * FROM student_attendance, attendance WHERE student_attendance.course_id = attendance.course_id and student_attendance.date_time = attendance.date_time and roll_no = "'+username+'";';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        for(i in result){
            var currDate = date_time().split(" ")[0];
            var currTime = date_time().split(" ")[1];
            var time = result[i].date_time.split(" ")[1];
            var date = result[i].date_time.split(" ")[0];
            // if (Date.parse(date) < Date.parse(currDate)) {
            //     console.log(date, time, result[i].exp_time);
            // }
            // console.log(currDate == date, currTime<time, result[i].status);
            console.log(getDistanceFromLatLon(req.body.location.split(" ")[0], req.body.location.split(" ")[1], result[i].lat, result[i].lon));
            if (currDate == date && addMinutes(time,result[i].exp_time) > currTime && result[i].status != "Present" && getDistanceFromLatLon(req.body.location.split(" ")[0], req.body.location.split(" ")[1], result[i].lat, result[i].lon) < 10) {
                // console.log(date, addMinutes(time,result[i].exp_time), result[i].exp_time);
                final.push({
                    url: "/student/portal/"+result[i].course_id+"/"+result[i].slot+"/"+result[i].date_time.split(" ")[0],
                    course_id: result[i].course_id,
                    date_time: result[i].date_time.split(" ")[0],
                    slot: result[i].slot.toString()
                });
            }
        }
        boo = false;
    });
    while(boo) await sleep(100);
    // console.log(final);
    res.render("student/portals", {user: user, final: final});
    
});

app.get("/student/portal/:course_id/:slot/:date_time", requireLogin, async (req,res) =>{
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    // let user = "Radhika N";
    // let username = "n_radhika";
    // console.log(req.params);
    var date_time = "";
    let sql = 'SELECT date_time FROM attendance WHERE  course_id = "'+req.params.course_id+'" and attendance.date_time REGEXP "'+req.params.date_time+' *" and attendance.slot = "'+req.params.slot+'";';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(result);
        date_time = result[0].date_time;
        // res.render("faculty/students",{url: "/faculty/"+req.params.course_id+"/"+req.params.slot+"/"+req.params.date_time, user: user, course_id: req.params.course_id,date_time: req.params.date_time, slot: req.params.slot, result: result});
    });
    while(date_time == "") await sleep(100);
    sql = 'UPDATE student_attendance SET status = "Present" WHERE roll_no = "'+username+'" and course_id = "'+req.params.course_id+'" and date_time = "'+date_time+'"';
    query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(sql,result);
    });
    sessionstorage.setItem("message", "Attendance Marked Successfully");
    res.redirect("/student");
});

app.get('/student/attendance', requireLogin, (req, res) => {
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
                    percentage: (total ? present/total*100 : 100).toFixed(2)
                }
                courses.push(obj);
            });
        }
        while(courses.length < result.length) await sleep(100);
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
        while(boo) await sleep(100);
        res.render("student/attendance",{user: user, courses: courses, total: total, present: present, absent: absent});
    });
});
app.get("/student/report/:course_id", requireLogin, (req,res) =>{
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

app.post('/student/od', (req, res) => {
    let sql = 'INSERT INTO `od`(`course_id`, `roll_no`, `date`, `slot`, `reason`) VALUES ("'+req.body.course+'","'+sessionstorage.getItem('username')+'","'+req.body.date+'","'+req.body.slot+'","'+req.body.reason+'");';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(result);
    });
    sessionstorage.setItem("message","OD Request Sent Successfully!!");
    res.redirect("/student");
    
});

// --------------------------------------Faculty--------------------------------------------------------
app.get('/faculty', requireLogin, (req, res) => {
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
        let ods = [];
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
            let boo = true;
            sql1 = 'SELECT * FROM od WHERE course_id = "'+result[i].course_id+'"';
            query1 = db.query(sql1, (err, res) => {
                if(err) throw err;
                // console.log(res);
                for(j in res){
                    if(res[j].status == "No")
                        ods.push({
                            url: '/faculty/od/'+res[j].roll_no+'/'+res[j].course_id+'/'+res[j].date+'/'+res[j].slot,
                            roll_no: res[j].roll_no,
                            course_id: res[j].course_id,
                            reason: res[j].reason,
                            date: res[j].date,
                            slot: res[j].slot
                        });
                }
                boo = false;
            });
            while(hours_left==-1 || students==-1 || boo) await sleep(100);
            courses.push({
                url: '/faculty/'+result[i].course_id,
                course_id: result[i].course_id,
                course_name: result[i].course_name,
                students: students,
                hours_left: hours_left
            });

        }
        while(courses.length < result.length) await sleep(100);
        var message = sessionstorage.getItem("message");
        sessionstorage.setItem("message","");
        res.render("faculty/home",{user: user, message: message, courses: courses, ods: ods});
    });

});

app.post("/faculty/createattendance", async (req,res) => {
    // console.log(req.body);
    var boo = true;
    let dateTime = date_time();
    sql = 'INSERT INTO attendance(course_id, date_time, slot, exp_time, lat, lon) VALUES ("'+req.body.course_id+'","'+dateTime+'","'+req.body.slot+'","'+req.body.exp_time+'","'+req.body.location.split(' ')[0]+'","'+req.body.location.split(' ')[1]+'");';
    query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        boo = false;
    });
    while(boo) await sleep(100);
    boo = true;
    sql = "SELECT roll_no FROM coursetostudent WHERE course_id = 'B.Tech..2020.R.CSE.3.19CSE314'";
    query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        for(i in result){
            sql1 = "INSERT INTO student_attendance(roll_no, course_id, date_time, status) VALUES ('"+result[i].roll_no+"','"+req.body.course_id+"','"+dateTime+"','Absent')";
            query1 = db.query(sql1, (err, result) => {
                if(err) throw err;
                // console.log(result);
            });        
        }
        boo = false;
    });
    while(boo) await sleep(100);
    sessionstorage.setItem("message","Attendance Portal created Successfully!!");
    res.redirect("/faculty");
});

app.get("/faculty/:course_id", requireLogin, async (req,res) => {
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
                url: "/faculty/"+req.params.course_id+"/"+result[i].slot+"/"+result[i].date_time.split(" ")[0],
                date_time: result[i].date_time,
                slot: result[i].slot.toString()
            });
        }
        // console.log(final);
        res.render("faculty/attendances",{user: user, course_id: req.params.course_id, result: final});
    });
});


app.get("/faculty/:course_id/:slot/:date_time", requireLogin, (req,res) =>{
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    // let user = "Radhika N";
    // let username = "n_radhika";
    // console.log(req.params);
    let sql = 'SELECT student_attendance.roll_no, student_attendance.status FROM student_attendance, attendance WHERE  attendance.course_id = student_attendance.course_id and attendance.date_time = student_attendance.date_time and attendance.course_id = "'+req.params.course_id+'" and attendance.date_time REGEXP "'+req.params.date_time+' *" and attendance.slot = "'+req.params.slot+'";';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(result);
        res.render("faculty/students",{url: "/faculty/"+req.params.course_id+"/"+req.params.slot+"/"+req.params.date_time, user: user, course_id: req.params.course_id,date_time: req.params.date_time, slot: req.params.slot, result: result});
    });
});

app.post("/faculty/:course_id/:slot/:date_time", (req,res) =>{
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    // let user = "Radhika N";
    // let username = "n_radhika";
    // console.log(req.body);


    let sql = 'SELECT student_attendance.roll_no, attendance.course_id, attendance.date_time FROM student_attendance, attendance WHERE  attendance.course_id = student_attendance.course_id and attendance.date_time = student_attendance.date_time and attendance.course_id = "'+req.params.course_id+'" and attendance.date_time REGEXP "'+req.params.date_time+' *" and attendance.slot = "'+req.params.slot+'";';
    let query = db.query(sql, async (err,result) => {
        if(err) throw err;
        // console.log(result);
        let count = 0;
        for(var i = 0; i < result.length; i++){
            let sql1 = 'UPDATE student_attendance SET status="'+req.body[result[i].roll_no]+'" WHERE roll_no="'+result[i].roll_no+'"and course_id="'+result[i].course_id+'" and date_time="'+result[i].date_time+'";';
            let query1 = db.query(sql1, (err,res) => {
                if(err) throw err;
                // console.log(res);
                count++;
            });
        }
        while(count<result.length) await sleep(100);
        res.redirect("/faculty/"+req.params.course_id+"/"+req.params.slot+"/"+req.params.date_time);
    });
});

app.post("/faculty/od/:roll_no/:course_id/:date_time/:slot", async (req,res) => {
    // console.log(req.params);
    var date_time = "";
    let sql = 'SELECT date_time FROM attendance WHERE  course_id = "'+req.params.course_id+'" and attendance.date_time REGEXP "'+req.params.date_time+' *" and attendance.slot = "'+req.params.slot+'";';
    let query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(result);
        date_time = result[0].date_time;
        // res.render("faculty/students",{url: "/faculty/"+req.params.course_id+"/"+req.params.slot+"/"+req.params.date_time, user: user, course_id: req.params.course_id,date_time: req.params.date_time, slot: req.params.slot, result: result});
    });
    while(date_time == "") await sleep(100);
    let boo = true;
    sql = 'UPDATE student_attendance SET status="Present" WHERE roll_no="'+req.params.roll_no+'"and course_id="'+req.params.course_id+'" and date_time = "'+date_time+'";';
    query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(sql,result);
        boo = false;
    });
    while (boo) await sleep(100);
    sql = 'UPDATE od SET status="Yes" WHERE roll_no="'+req.params.roll_no+'"and course_id="'+req.params.course_id+'" and date = "'+req.params.date_time+'" and slot = "'+req.params.slot+'";';
    query = db.query(sql, (err,result) => {
        if(err) throw err;
        // console.log(sql,result);
        res.redirect("/faculty");
    });

    
});



// --------------------------------------Parent---------------------------------------------------------
app.get('/parent', requireLogin, async (req, res) => {
    let user = sessionstorage.getItem("user");
    let username = sessionstorage.getItem("username");
    var courses = [];
    var boo = true;
    // ----
    let sql = 'SELECT course.course_id, course.course_name, faculty.name FROM coursetostudent, course, faculty WHERE course.course_id = coursetostudent.course_id and course.faculty_id = faculty.faculty_id and coursetostudent.roll_no = "'+username+'"';
    let query = db.query(sql, async (err, result) => {
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
                    course_id: result[i].course_id,
                    course_name: result[i].course_name,
                    name: result[i].name,
                    total: total,
                    percentage: (total ? present/total*100 : 100).toFixed(2)
                }
                // courses.push(obj);
            });
        }
        while(courses.length < result.length) await sleep(100);
        boo = false;
    });
    while(boo) await sleep(100);
    // ----
    var child = "";
    sql = 'SELECT * FROM student WHERE roll_no = "'+username+'"';
    query = db.query(sql, (err, result) => {
            if(err) throw err;
            console.log(result);
            child = result[0].name;
    });
    while(child == "") await sleep(100);
    sql = 'SELECT * FROM student_attendance WHERE roll_no = "'+username+'"';
    query = db.query(sql, (err, result) => {
        if(err) throw err;
        // console.log(result);
        var present = 0, absent = 0;
        for(var i = 0; i < result.length; i++) {
            if(result[i].status == "Present") present++;
            if(result[i].status == "Absent") absent++;
        }
        res.render("parent/home",{user: user, child: child, present: present, absent: absent, courses: courses});
    });
});

// --------------------------------------Admin----------------------------------------------------------
app.get('/admin', requireLogin, (req, res) => {
    let user = sessionstorage.getItem("user");
    res.render("admin/home",{user: user});
});

app.post('/admin/createuser', (req, res) => {
    // console.log(req.body);
    if(req.body.role == "Student"){
        let sql = 'INSERT INTO `student` VALUES ("'+req.body.username+'","'+req.body.name+'","'+req.body.password+'")';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            // console.log(result);
            res.redirect("/admin");
        });
    }
    else if(req.body.role == "Faculty"){
        let sql = 'INSERT INTO `faculty` VALUES ("'+req.body.username+'","'+req.body.name+'","'+req.body.password+'")';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            // console.log(result);
            res.redirect("/admin");
        });
    }
    else if(req.body.role == "Parent"){
        let sql = 'INSERT INTO `parent` VALUES ("'+req.body.name+'","'+req.body.username+'","'+req.body.password+'")';
        let query = db.query(sql, (err, result) => {
            if(err) throw err;
            // console.log(result);
            res.redirect("/admin");
        });
    }
});