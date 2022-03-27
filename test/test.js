//# define LICENSE license_key
//#define coolKey ImCool
import * as another from "./anotherFile.js";

//normal comment
// Second comment

//# if dev
console.log("dev1");// dev
//# endif dev

//#if build
console.log("build1"); // build
//#endif build

//# if dev
console.log("dev2");
//# if build
console.log("build2");
//# endif build
//# endif dev

if(true) {
    // Comment in function
    let license = "LICENSE";
    console.log("coolKey");
    if(another.hello("abc" == "abc")) console.log("Hi !")
}