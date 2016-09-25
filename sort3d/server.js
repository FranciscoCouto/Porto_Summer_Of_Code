var express = require('express');

var fs = require('fs');
var favicon = require('serve-favicon');
var http = require('http');
var https = require('https');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = "50caf12f04a421725182"
var GITHUB_CLIENT_SECRET = "78ccd8ed6c54e61d7df4e8a9ff081797affaf0d2";

var accesstoken = '';

var app = express();

var useragent = require('express-useragent');

app.set('httpport', process.env.PORT || 3000);
app.set('httpsport', process.env.PORT || 2000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb'}));

app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(session({ secret: 'anything'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


function sendGit(req,res,repid)
{
    var rep = req.body.git;

    var issueData = JSON.stringify({
        "title": "Bug from Snip3d",
        "body":"localhost:3000/report/"+repid
    });

    var options = {
        host: 'api.github.com',
        path: '/repos/'+ req.user._json.login+'/'+rep+'/issues?access_token='+accesstoken,
        headers: {
            'User-Agent': req.headers['user-agent'],
        },
        method: 'POST'
    };

    var requestaddIssue  = https.request(options, function(responseFromIssues){
        responseFromIssues.setEncoding('utf8');
        var issueBody = '';
        responseFromIssues.on('data', function(chunk){
            //console.log('>>>>chunk>>>>>',chunk);
            issueBody += chunk;
        });
        responseFromIssues.on('end',function(issueBody){
            //console.log(issueBody);
        });
        });
    requestaddIssue.write(issueData);
    requestaddIssue.end();

}

app.get('/success', function(req, res){
	res.send("success logged in");
});

app.get('/js/:file', function(req, res){
	res.sendFile(__dirname + '/public/js/'+req.params.file);
});

app.get('/css/:file', function(req, res){
	res.sendFile(__dirname + '/public/css/'+req.params.file);
});

app.get('/img/:file', function(req, res){
	res.sendFile(__dirname + '/public/img/'+req.params.file);
});

app.get('/img/reports/:file', function(req, res){
	res.sendFile(__dirname + '/public/img/reports/'+req.params.file);
});

app.get('/error', function(req, res){
	res.send("error logged in");
});

app.get('/', function(req, res){
    var repos = "",
    opts = {
        host: "api.github.com",
        path: '/user/repos?access_token=' + accesstoken,
        headers: {
            'User-Agent': req.headers['user-agent'],
        },
        method: "GET"
    },
    request = https.request(opts, function(resp) {
        var data = "";
        resp.setEncoding('utf8');
        resp.on('data', function (chunk) {
            data += chunk;
        });
        resp.on('end', function () {
            repos = JSON.parse(data);
            getData('SELECT * FROM [dbo].[Report] INNER JOIN [dbo].[Issue] ON Report.report_id = Issue.report_id', function(err, rows) {
                if (err) {
                    // Handle the error
                    res.render('pages/index', { user: req.user, repos: repos,bugs: "" })
                } else if (rows) {
                    var index3 = 0;
                    var bugsfinal = [];
                    for (var index = 0; index < repos.length; ++index) {
                        for (var index2 = 0; index2 < rows.length; ++index2) {
                            if(repos[index].name === rows[index2].git){
                                bugsfinal.push({
                                    report_id: rows[index2].report_id,
                                    comment: rows[index2].comment,
                                    git: rows[index2].git
                                });
                            }
                        }

                    }
                    //console.log(bugsfinal);

                   res.render('pages/index', { user: req.user, repos: repos, bugs: bugsfinal })
                
                    // Process the rows returned from the database
                } else {
                    res.json(rows);
                    // No rows returns; handle appropriately
                }
    });
            //console.log(repos[1])
        });
    });
    request.end();
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
        accesstoken = accessToken;
        insertData("INSERT [dbo].[User] (username,token,email,user_id,name,image) OUTPUT INSERTED.username VALUES (@username,@token,@email,@user_id,@name,@image)", 
            ['username', 'token', 'email', 'user_id','name','image'], 
            [profile._json.login, accessToken, profile._json.email, profile._json.id,profile._json.name,profile._json.avatar_url], 
            [TYPES.NVarChar, TYPES.NVarChar, TYPES.NVarChar , TYPES.NVarChar, TYPES.NVarChar, TYPES.NVarChar], function(err, rows) {

                if(err)
                    console.log('User Already Existed!');
                else
                    console.log('User Created!');
                
                return done(null, profile);
            });
    });
    }
));

app.get('/auth/github', passport.authenticate('github', {
  scope: ['user', 'repo'],
  state: 'foobar'
}));

app.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect:'/'}));

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/testeGetUsers', function(req, res){
    getData("SELECT * FROM [dbo].[Report] INNER JOIN [dbo].[Issue] ON Report.report_id = Issue.report_id", function(err, rows) {
        if (err) {
            // Handle the error
            res.json(err);
        } else if (rows) {
            res.json(rows);
            // Process the rows returned from the database
        } else {
            res.json(rows);
            // No rows returns; handle appropriately
        }
    });

});

app.get('/report/:report_id', function(req, res){
    getData('SELECT * FROM [dbo].[Report] INNER JOIN [dbo].[Issue] ON Report.report_id = Issue.report_id and Report.report_id = '+ req.params.report_id, function(err, rows) {
        if (err) {
            // Handle the error
            res.json(err);
        } else if (rows) {
            //console.log(rows);
            res.render('pages/report', { rows: rows, info : rows[0] })
           
            // Process the rows returned from the database
        } else {
            res.json(rows);
            // No rows returns; handle appropriately
        }
    });
});

http.createServer(app).listen(app.get('httpport'), function(){
  console.log('Express HTTP server listening on port ' + app.get('httpport'));
});

https.createServer(app).listen(app.get('httpsport'), function(){
  console.log('Express HTTPS server listening on port ' + app.get('httpsport'));
});

function loggedIn(req, res, next) {
 if (req.isAuthenticated()) { return next(); }
 res.redirect('/')
}




//============================================================ TEDIOUS




var Connection = require('tedious').Connection;
var config = {
    userName: 'bthree@bporto.database.windows.net',
    password: 'MIEICinhos1',
    server: 'bporto.database.windows.net',
    // If you are on Microsoft Azure, you need this:
    options: {
        encrypt: true,
        database: 'b_porto'
    }
};
var connection = new Connection(config);
connection.on('connect', function(err) {
    // If no error, then good to proceed.
    if (err)
        console.log("Resposta azure: " + err);
    else
        console.log("Azure - Connected");
});

var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;


function getData(Query, callback) {
    var connection = new Connection(config);
    var newdata = [];
    var dataset = {};
    connection.on('connect', function(err) {
        var Request = require('tedious').Request;
        var request = new Request(Query, function(err, rowCount) {
            if (err) {
                console.log("Resposta azure: " + err);
                callback(err);
            } else {
                if (rowCount < 1) {
                    dataset['err'] = false;
                    callback(null, dataset);
                } else {
                    callback(null, newdata);
                }
            }
        });
        request.on('row', function(columns) {
            dataset = {};
            columns.forEach(function(column) {
                dataset[column.metadata.colName] = String(column.value).trim();
            });
            newdata.push(dataset);
        });
        connection.execSql(request);
    });
}


function insertData(Query, paramName, paramValue, types, callback) {
    request = new Request(Query, function(err) {
        if (err) {
            console.log("Resposta azure: " + err);
            callback(err);
        }
    });

    for (i = 0; i < paramName.length; i++) {
        //console.log(paramName[i]+"...."+ types[i]+"...."+paramValue[i]);
        request.addParameter(paramName[i], types[i], paramValue[i]);
    }
    //request.addParameter('Number', TYPES.NVarChar , 'SQLEXPRESS2014');
    //request.addParameter('Cost', TYPES.Int, 11);

    request.on('row', function(columns) {
        columns.forEach(function(column) {
            if (column.value === null) {
                callback(null, 'not done');
            } else {
                callback(null, column.value);
            }
        });
    });
    connection.execSql(request);
}


function saveIssues(id,coords,comments,i){

  console.log(coords);
  console.log(comments);
  console.log(id);
  console.log(i);
  console.log(coords.length);
  if(i >= coords.length)
    return;

insertData("INSERT [dbo].[Issue] (report_id,x1,x2,y1,y2,w,h,comment) OUTPUT INSERTED.report_id VALUES (@report_id,@x1,@x2,@y1,@y2,@w,@h,@comment)", 
    ['report_id', 'x1', 'x2', 'y1','y2', 'w', 'h','comment'], 
    [id, coords[i]['x1'], coords[i]['x2'],coords[i]['y1'], coords[i]['y2'], coords[i]['w'], coords[i]['h'],comments[i]], 
    [TYPES.NVarChar,TYPES.NVarChar,TYPES.NVarChar,TYPES.NVarChar,TYPES.NVarChar,TYPES.NVarChar,TYPES.NVarChar,TYPES.NVarChar], function(err, rows) {
        if(err){
            console.log(err);
        }
        else if(rows)
        {
            setTimeout(function() {
            i= i+1;
            saveIssues(id,coords,comments,i);
}, 100);
        }

    });

}


app.post('/saveReport', function(req,res){

	insertData("INSERT [dbo].[Report] (browser_info,data,operative_system,email,image, git, screen) OUTPUT INSERTED.report_id VALUES (@browser_info,@data,@operative_system,@email,@image, @git, @screen)", 
        ['browser_info', 'data', 'operative_system', 'email','image', 'git', 'screen'], 
        [req.body.info, req.body.date, req.body.os, req.body.email,"", req.body.git, req.body.screen], 
        [TYPES.NVarChar, TYPES.NVarChar, TYPES.NVarChar , TYPES.NVarChar, TYPES.NVarChar, TYPES.NVarChar, TYPES.NVarChar], function(err, rows) {

            if(err)
                console.log('Report Already Existed!');
            else{

             fs.writeFile('public/img/reports/'+rows+'.png', req.body.img, 'base64', function (err) {
               if(err){
                  console.log("An error ocurred creating the file "+ err.message);
              }
              else
              {
                coords = req.body.coords;
                comments = req.body.comments;
                //console.log(req.body.coords);
               // console.log(coords);
               sendGit(req,res,rows);

               saveIssues(rows,coords,comments,0);
           }
       });
         } 

         return;
     });
});

