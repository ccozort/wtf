var x = 12;
var y = [1,2,"duder", true, x];

// for (i=0;y.leng; i++) {
//     console.log(y[i]);
// }



if (x < 10) {
  console.log("x, do you even lift?");
}
else {
  console.log("what?")
}

function doStuff(message){
  console.log(message);
  this.thing = "sometext";
  console.log(this.thing);
  return("psych!!");
  
}
doStuff("hello there");
var stuff = new doStuff("hello friend");