var express = require('express');
var request = require('request');
var jwt = require('jsonwebtoken');
var auth = require('./auth');
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
            client_id : "l7xxa649deed12e340b29da3ab26f750521e",
            client_secret : "6566b42f380c44be8808cd9bc90523ca",
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
});

app.get('/qrcode', function(req, res){
    res.render('qrcode');
});

app.get('/qr', function(req, res){
    res.render('qrcodeReader');
});

app.get('/balance', function(req,res){
    res.render('balance');
});

app.post('/balance',auth, function(req, res){
    var finusenum = req.body.finNum;
    var selectUserSql = "SELECT * FROM fintech.usertbl WHERE user_id = ?";
    connection.query(selectUserSql,[req.decoded.userId], function(err, result){
        var accessToken = result[0].accessToken;
        var qs = "?fintech_use_num="+finusenum+"&tran_dtime=20190919105400"
        option = {
            url : "https://testapi.open-platform.or.kr/v1.0/account/balance"+qs,
            method : "GET",
            headers : {
                "Authorization" : "Bearer " + accessToken
            },
        }
        request(option, function (error, response, body) {
            console.log(body);
            if(error){
                console.error(error);
                throw error;
            }
            else {
                console.log(body);
                var resultObj = JSON.parse(body);
                res.json(resultObj);
            }
        });
    })
});

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
});

//signup page routing
app.get("/signup", function(request, response){
    response.render('signup');
});

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

app.post('/getUser', auth, function(req, res){
    console.log(req.decoded);
    var selectUserSql = "SELECT * FROM fintech.usertbl WHERE user_id = ?";
    var userseqnum = "";
    var userAccessToken = "";
    connection.query(selectUserSql, [req.decoded.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result);
            userseqnum = result[0].userseqnum;
            userAccessToken = result[0].accessToken;
            console.log("parameter :", userseqnum, userAccessToken);

            var qs = "?user_seq_no=" + userseqnum
            option = {
                url : "https://testapi.open-platform.or.kr/user/me"+qs,
                method : "GET",
                headers : {
                    "Authorization" : "Bearer "+ userAccessToken
                },
            }
            request(option, function (error, response, body) {
                if(error){
                    console.error(error);
                    throw error;
                }
                else {
                    var responseObj = JSON.parse(body);
                    res.json(responseObj);
                }
            });
        }
    })
});

app.post('/withdrawQR', auth, function(req, res){
    console.log(req.decoded);
    var selectUserSql = "SELECT * FROM fintech.usertbl WHERE user_id = ?"
    var userseqnum = "";
    var userAccessToken = "";
    connection.query(selectUserSql, [req.decoded.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            userseqnum = result[0].userseqnum;
            userAccessToken = result[0].accessToken;
            option = {
                url : "https://testapi.open-platform.or.kr/v1.0/transfer/withdraw",
                method : "POST",
                headers : {
                    "Authorization" : "Bearer "+ userAccessToken,
                    "Content-Type" : "application/json"
                },
                json : {
                    "dps_print_content": "널앤서",
                    "fintech_use_num": "199003328057724253012100",
                    "tran_amt": "11000",
                    "tran_dtime": "20190920104620"                  
                }
            }
            request(option, function (error, response, body) {
                if(error){
                    console.error(error);
                    throw error;
                }
                else {
                    var responseObj = body;
                    if(responseObj.rsp_code== "A0002" || responseObj.rsp_code== "A0000"){
                        res.json(1);
                    }
                    else {
                        res.json(2);
                    }
                }
            });
        }
    })
});

app.post('/transactionList',auth, function(req, res){
    var finusenum = req.body.finNum;
    var selectUserSql = "SELECT * FROM fintech.usertbl WHERE user_id = ?";
    connection.query(selectUserSql,[req.decoded.userId], function(err, result){
        var accessToken = result[0].accessToken;
        var qs = "?fintech_use_num="+finusenum+
        "&inquiry_type=A" +
        "&from_date=20161001" +
        "&to_date=20161001" +
        "&sort_order=D" +
        "&page_index=1" +
        "&tran_dtime=20190919105400" 
        option = {
            url : "https://testapi.open-platform.or.kr/v1.0/account/transaction_list"+qs,
            method : "GET",
            headers : {
                "Authorization" : "Bearer " + accessToken
            },
        }
        request(option, function (error, response, body) {
            console.log(body);
            if(error){
                console.error(error);
                throw error;
            }
            else {
                console.log(body);
                var resultObj = JSON.parse(body);
                res.json(resultObj);
            }
        });
    });
});

app.listen(port);
console.log("Listening on port ", port);