var car1 = {
    name : "sonata",
    ph : "500ph",
    start : function(){
        console.log("engine is starting");
    },
    stop : function(){
        console.log("engine is stopped");
    }
}
var car2 = {
    name : "제네시스",
    ph : "500ph",
    start : function(){
        console.log("engine is starting");
    },
    stop : function(){
        console.log("engine is stopped");
    }
}
console.log(car1);
car1.start()

var carArray = [car1, car2];
console.log(carArray[1].name);