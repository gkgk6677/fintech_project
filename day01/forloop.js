var cars = ["BMW", "Volvo", "Saab", "Ford", "Fiat", "Audi"];
var string = "";

for(i=0; i<cars.length; i++){
    if(cars[i] === 'BMW'){
        cars[i] = '!';
    }
    string = string + `${cars[i]} `;
};
console.log(string);