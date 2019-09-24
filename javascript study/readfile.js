//비동기 함수를 통한 텍스트파일 읽기
var fs = require('fs');

fs.readFile('/sample/example.txt','utf-8',function(err,data){
    if(err){
        console.error(err);
        throw err;
    }
    else{
        console.error("두번째 기능인데 파일을 읽어오느라 시간이 조금...걸립니다.");
        console.log(`텍스트파일 내용 : ${data}`);
    }
});
console.log("마지막 기능입니다.");