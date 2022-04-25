//# define DEFINE_1 Hello_world_!

// 2 defines, we should always take the last one
//#define DEFINE_2  This_should_not_happen_!
//#define DEFINE_2  How_are_you_?


import * as secondary from "./secondary.js";

//#define FALSE   true
//              ^ 3 spaces
// Blank lines are hidden

console.log(" - DEFINE_1".replaceAll("_", " "));
console.log(" - DEFINE_2\n".replaceAll("_", " "));

//#   if dev   
console.log("This line will be only executed in dev mode.");
//# endif dev
//#if  dev
console.log("Useful for easy debbuging !");
//#  endif  dev

console.log("\nThis line will be printed no matter what.");

//# if build
console.log("This line will be only executed in build mode.");
//# endif build
//#if  build
console.log("Useful for hiding code in production !");
//#  endif  build

// Comment-only lines are hidden by default !
	// Comment-only lines are hidden by default !
		//Comment-only lines are hidden by default !

console.log(); // This comment is not hidden yet, maybe in the future ? Who knows...

const constantVariable = FALSE;

if(constantVariable) {
	if (secondary.hello("Hi !") === "Hi !") console.log(" - Hi secondary.js !");
}