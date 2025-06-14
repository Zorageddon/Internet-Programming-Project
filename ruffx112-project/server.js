const bcrypt = require('bcrypt');
const fs = require('fs');
const express = require('express');
var session = require('express-session');
const sanitizer = require('express-sanitizer');
const app = express();
const port = 4131;
const mysql = require('mysql2');

const db = mysql.createConnection({
    user: 'C4131S25S02U61',
    host: 'localhost',
    port: 3306,
    password: 'anorak',
});

app.set('views', 'views');
app.set('view engine', 'pug');

app.use(express.static('static/css'));
app.use(express.static('static/img'));
app.use(express.static('static/js'));
app.use(express.json());
app.use(sanitizer());

app.use(session({
    secret: 'csci4131secretkey',
    saveUninitialized: true,
    resave: false
}));

function checkSignIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.render('auth');
    }
}

app.get('/', function(req,res) {
    res.redirect('/todo');
});

app.get('/auth', function(req, res) {
    res.render('auth');
});
app.get('/todo', checkSignIn, function(req, res) {
    res.render('todo', {user: `${req.session.user}`});
});

app.get('/getTodo/:user', checkSignIn, function(req,res) {
    const sanUser = req.sanitize(req.params.user);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        db.query(`SELECT * FROM todo WHERE owner='${sanUser}';`, function(err,data) {
            if (err) throw err;
            res.render('list', {selectedStatus: 'none', selectedDeadline: 'none', data: data});
        });
    });
});

app.get('/addForm', checkSignIn, function(req,res) {
    res.render('addForm', {user: `${req.session.user}`});
});

app.post('/add', checkSignIn, function(req,res) {
    const sanTask = req.sanitize(req.body.task);
    const sanOwn = req.sanitize(req.body.owner);
    const sanDesc = req.sanitize(req.body.description);
    const sanDead = req.sanitize(req.body.deadline);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        db.query(`INSERT INTO todo (task, status, owner, description, deadline) \
            VALUES ('${sanTask}', 'Todo', '${sanOwn}', '${sanDesc}', '${sanDead}');`, function(err,data) { 
                if (err) throw err;
                res.redirect('/todo');
            });
    });
});

app.get('/delete/:id', checkSignIn, function(req,res) {
    const sanId = req.sanitize(req.params.id);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        db.query(`DELETE FROM todo WHERE id=${sanId};`, function(err,data) { 
                if (err) throw err;
                res.status(200).send();
            });
    });
});

app.get('/cycle/:id', checkSignIn, function(req,res) {
    const sanId = req.sanitize(req.params.id);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        db.query(`SELECT status FROM todo WHERE id='${req.params.id}';`, function(err,data) {
            if (err) throw err
            let status = '';
            if (data[0].status == 'Todo') {
                status = 'In Progress';
            } else if (data[0].status == 'In Progress') {
                status = 'Done';
            } else {
                status = 'Todo';
            }
            db.query(`UPDATE todo \ SET status='${status}' \ WHERE id='${req.params.id}';`, function(err,data) {
                res.status(200).send();
            });
        });
    });
});

app.get('/filter/:status/:deadline', checkSignIn, function(req,res) {
    const sanStatus = req.sanitize(req.params.status);
    const sanDead = req.sanitize(req.params.deadline);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        let sqlcmd = `SELECT * FROM todo WHERE owner='${req.session.user}'`;
        if (sanStatus == 'None') {
            sqlcmd += ``;
        } else {
            sqlcmd += ` AND status='${sanStatus}'`;
        }
        switch (sanDead) {
            case 'None':
                sqlcmd += `;`;
                break;
            case 'Asc':
                sqlcmd += ` \ ORDER BY deadline;`;
                break;
            case 'Desc':
                sqlcmd += ` \ ORDER BY deadline DESC;`;
                break;
            case 'Overdue':
                sqlcmd += ` AND (deadline < NOW() AND status!='Done');`
                break;
        }
        db.query(sqlcmd, function(err,data) {
            if (err) throw err;
            res.render('list', {selectedStatus: sanStatus, selectedDeadline: sanDead, data: data});
        });
    });
});

app.post('/login', function(req, res) {
    const sanUser = req.sanitize(req.body.user);
    const sanPass = req.sanitize(req.body.password);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        db.query(`SELECT * FROM users WHERE user='${sanUser}';`, function(err, data) {
            if (err) throw err;
            if (data.length >= 1) {
                if (bcrypt.compareSync(sanPass, data[0].password)) {
                    req.session.user = sanUser;
                    res.redirect('/todo');
                    return;
                }
            }
            res.status(401).send();
            return;
        });
    });
});

app.post('/signup', function(req, res) {
    const sanUser = req.sanitize(req.body.user);
    const sanPass = req.sanitize(req.body.password);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        db.query(`SELECT * FROM users WHERE user='${sanUser}';`, function(err, data) {
            if (err) throw err;
            if (data.length < 1) {
                const passhash = bcrypt.hashSync(sanPass, 10)
                db.query(`INSERT INTO users (user, password) \ VALUES ('${sanUser}', '${passhash}');`, function(err, data) {
                    if (err) throw err;
                });
                res.json({status:'success'});
                return;
            }
            res.json({status:'fail'});
            return;
        });
    });
});

app.get('/deleteAcct/:user', checkSignIn, function(req,res) {
    const sanUser = req.sanitize(req.params.user);
    db.connect(function(err) {
        if (err) throw err;
        db.query('USE C4131S25S02U61;');
        db.query('CREATE TABLE IF NOT EXISTS users (\
				user VARCHAR(255) PRIMARY KEY,\
				password VARCHAR(255) NOT NULL\
		);', (err) => { if (err) throw err; });
        db.query(`DELETE FROM users WHERE user=${sanUser};`, function(err,data) {
            if (err) throw err;
            db.query(`DELETE FROM todo WHERE owner=${sanUser};`, function(err,data) {
                if (err) throw err;
                res.redirect('/logout');
            });
        });
    });
});

app.get('/logout', checkSignIn, function(req, res) {
    req.session.destroy();
    res.redirect('/auth');
});

app.use((req, res, next) => {
	res.status(404).send('Route Not Found!');
});

app.listen(port, () => {
    console.log('Listening...');
});