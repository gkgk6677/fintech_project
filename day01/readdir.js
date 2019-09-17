var fs = require('fs');

fs.readdir('day01', function(err,filelist){
    console.log(filelist);
});