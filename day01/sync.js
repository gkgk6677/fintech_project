//동기적 함수의 특성을 활용한 텍스트 파이 읽기
var fs = require('fs');

console.log('A');

var result = fs.readFileSync('./sample/example.txt', 'utf-8');

console.log(result);

console.log('B');