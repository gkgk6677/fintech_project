var express = require('express');
var request = require('request');
var jwt = require('jsonwebtoken');
// var bodyParser = require('body-parser');

app = express();

// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended : false}));

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '0000',
  database : 'fintech'
});
connection.connect(); 

//view 및 ejs 추가
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var port = process.env.port || 3000;

// public 폴더 내에 있는 파일들(css 같은 것)을 적용할 때 위치를 routing해서 지정해주는 역할
app.use(express.static(__dirname + '/public'));

//index routing
app.get("/main", function(request, response){
    response.render('main');
});

//routing
app.get("/sayHello", function(request, response){
    var user_name = request.query.user_name;
    response.end("Hello " + user_name + "!");
});

//sendUserData routing
app.get("/sendUserData", function(request, response){
    var userId = request.query.userId;
    var password = request.query.password;
    console.log(`userId : ${userId}`);
    console.log(`password : ${password}`);
    response.json(1);
});

//authResult page routing
app.get("/authResult", function(req, res){
    var authcode = req.query.code;
    console.log(authcode)

    option = {
        url : "https://testapi.open-platform.or.kr/oauth/2.0/token",
        method : "POST",
        headers : {},
        form : {
            code : authcode,
            client_id : "l7xxa52752a2f65d415492ab0e821f6894cf",
            client_secret : "7d10a5d12b224908a7edb7b3cbd1628d",
            redirect_uri : "http://localhost:3000/authResult",
            grant_type : "authorization_code"
        }
    };
    request(option, function(error, response, body){
        console.log(body);
        if(error){
            console.error(error);
            throw error;
        }
        result = res.json(body);
        console.log(result);
    });
});

//index page routing
app.get("/index", function(request, response){
    response.render('index-page');
});

//signin page routing
app.get("/signin", function(request, response){
    response.render('signin');
})

app.post("/signin", function(request, response){
    var userId = request.body.userId;
    var password = request.body.password;
    console.log(userId);
    console.log(password);
    var sql = "SELECT * FROM usertbl WHERE user_id = ?";
    connection.query(sql, [userId], function(error, results){
        if(error){
            console.error(error);
            throw error;
        }
        else{
            if(password == results[0].user_password){
                jwt.sign(
                    {
                        userId : results[0].user_id,
                        comment : "안녕하세요"
                    },
                    "abcdefg123456",
                    {
                        expiresIn : '5m',
                        issuer : 'fintech.admin',
                        subject : 'user.login.info'
                    },
                    function(err, token){
                        console.log('로그인 성공', token)
                        response.json(token)
                    }
                )            
            }
            else {
                response.json('등록정보가 없습니다');
            }
        }
    })
})

//signup page routing
app.get("/signup", function(request, response){
    response.render('signup');
})

app.post("/signup", function(req, res){
    var email = req.body.email;
    var password = req.body.password;
    var access_token = req.body.access_token;
    var refresh_token = req.body.refresh_token;
    var useseqnum = req.body.useseqnum;

    var sql = "INSERT INTO `fintech`.`usertbl` " +
    "(`user_id`, `user_password`, `phone`, `accessToken`, `refreshToken`, `userseqnum`)"+
    " VALUES (?,?,?,?,?,?)";

    connection.query(sql,[email,password,"010",access_token ,refresh_token,useseqnum],function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            res.json(1);
        }
    }) 
});

app.listen(port);
console.log("Listening on port ", port);