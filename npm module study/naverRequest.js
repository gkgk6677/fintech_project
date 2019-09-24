//naver request를 통해 불러오기

var request = require('request');

request('http://www.google.co.kr', function(err,res,body){
    console.log(`error : ${err}`);
    console.log(`statusCode : ${res} && ${res.statusCode}`);
    console.log(`body : ${body}`);
});