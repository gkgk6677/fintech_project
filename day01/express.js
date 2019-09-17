var express = require('express');

app = express();

//view 및 ejs 추가
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var port = process.env.port || 8080;

// public 폴더 내에 있는 파일들(css 같은 것)을 적용할 때 위치를 routing해서 지정해주는 역할
app.use(express.static(__dirname + '/public'));

//index routing
app.get("/", function(request, response){
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

//index page routing
app.get("/index", function(request, response){
    response.render('index-page');
});

app.listen(port);
console.log("Listening on port ", port);