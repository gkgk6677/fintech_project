var fs = require('fs');

function callbackFunc(callback){
    fs.readFile('day01/sample/example.txt', 'utf-8', function(err,data){
        if(err){
            console.error(err);
            throw err;
        }
        else{
            console.log('텍스트 파일을 읽어오느라 시간이 조금...걸립니다..');
            callback(data);
        }
    });    
}

console.log('A');
callbackFunc(function (data){
    console.log(data);
    console.log('B');    
})