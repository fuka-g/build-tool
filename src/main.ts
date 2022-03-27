import fse from "fs-extra";
import readdirp from "readdirp";
import JavaScriptObfuscator from "javascript-obfuscator";

/**
 * compiles a single file
 * @param path The file path
 */
function compileFile(basename: string, path: string, destination: string, parameters: string[], obfuscate: boolean, obfuscationParameters: any) {

    // Reads the file's content
    let mainFile: string[] = fse.readFileSync(path).toString().split("\n");

    // The final script that will be written to the destination folder
    let builtFile: string[] = new Array();

    // List all instances of //# define
    let defineArray: string[] = new Array();

    // List all active filters (//# if's)
    let activeFiltersArray: string[] = new Array();

    // Values array (true if the key is in the array)
    let filtersValueArray: string[] = new Array();

    if(parameters) {
        parameters.forEach(element => {
            filtersValueArray.push(element);
        });
    }
    
    for (const line in mainFile) {

        // Trims the line so there are no leading spaces or tabs
        let trimmedLine = mainFile[line].trim();

        // If the line starts with the default prefix (//#)
        // We start parsing it and try to see what we want to do
        if (trimmedLine.startsWith("//#")) {

            // Arguments are separated by spaces
            let lineArguments = trimmedLine.replace("//#", "").trim().split(" ");
            if (trimmedLine.startsWith("//# define") || trimmedLine.startsWith("//#define") ||
                trimmedLine.startsWith("//# def") || trimmedLine.startsWith("//#def")) {

                // If the arguments are set
                if (lineArguments[1] && lineArguments[2]) {

                    // Push the arguments in defineArray
                    defineArray.push(lineArguments[1]);
                    defineArray.push(lineArguments[2]);
                }
            }
            if (trimmedLine.startsWith("//# if") || trimmedLine.startsWith("//#if")) {
                if (activeFiltersArray.indexOf(lineArguments[1]) === -1) {
                    activeFiltersArray.push(lineArguments[1]);
                }
            }
            if (trimmedLine.startsWith("//# endif") || trimmedLine.startsWith("//#endif")) {

                // If there is an argument after endif (//#endif dev)
                if (lineArguments[1]) {

                    //Get it's index in the active filter array
                    let indexOfFilter = activeFiltersArray.indexOf(lineArguments[1]);

                    // If it's in the array
                    if (indexOfFilter !== -1) {
                        // Remove it
                        activeFiltersArray.splice(indexOfFilter);
                    }
                }
                else {
                    // If no argument is found, remove the newest filter provided
                    activeFiltersArray.pop();
                }
            }
        }
        else {
            if (trimmedLine !== "") {

                // Apply //# define's
                for (let i in defineArray) {

                    // parseInt because for some reason i is a string
                    let arrayIndex = parseInt(i);

                    // defineArray is alternating key and values
                    // Only triggers when we're on a key
                    if (!(arrayIndex % 2)) {
                        mainFile[line] = mainFile[line].replace(defineArray[arrayIndex], defineArray[arrayIndex + 1]);
                    }
                }

                let ignoreLine = false;

                if(trimmedLine.startsWith("//")) ignoreLine = true;

                for (const i in activeFiltersArray) {
                    if (filtersValueArray.indexOf(activeFiltersArray[i]) === -1) {
                        ignoreLine = true;
                    }
                }
                if (!ignoreLine) {
                    // Push the line of code to be written to the dest folder
                    builtFile.push(mainFile[line]);
                }
            }
        }
    }

    let builtFileString: string = builtFile.join("\n");

    if(obfuscate) {
        var obfuscationResult = JavaScriptObfuscator.obfuscate(
            builtFileString,
            obfuscationParameters
        );

        builtFileString = obfuscationResult.getObfuscatedCode();
    }

    fse.writeFileSync(destination + "/" + basename, builtFileString);
}

/**
 * Main function
 * @param root The source root folder
 */
export function main(parameters: string[]) {
    let config = JSON.parse(fse.readFileSync("./package.json")).buildConfig;

    //console.log(config);
    
    let obfuscate = false;
    //let parameters: string[];

    if(config.src) {
        if(config.dest) {

            // If we provide parameters through the function call (cli arguments)
            // Use them, if not, use the default config in package.json
            if(parameters.length === 0) parameters = config.parameters;
            
            // Config data validation
            if(typeof config.src !== "string") throw new Error("config.src must be a string");
            if(typeof config.dest !== "string") throw new Error("config.dest must be a string");

            // Check if the parameters field is an array
            // Throw an error if not
            if(config.parameters && typeof config.parameters !== "object") {
                throw new Error("config.parameters must be an Array");
            }
            
            // If config.obfuscate is true or "true", use code obfusation
            if(config.obfuscate === "true" || config.obfuscate === true) obfuscate = true;
            else {
                // Conditional obfuscation
                // Use "obfuscate": "VAR" in package.json where VAR is a parameter name
                // The code will be obfuscated ONLY if the parameter is set
                if(config.obfuscate) {
                    for (const i in parameters) {
                        if(parameters[i] == config.obfuscate) obfuscate = true;
                    }
                }
            }

            // If we don't provide an obfuscationParameters object, ignore obfuscation
            if(typeof config.obfuscationParameters !== "object") obfuscate = false;

            // Recursively read source folder
            readdirp(config.src, { fileFilter: '*.js', alwaysStat: false })
                .on('data', (entry) => {
                    // Send the file to compileFile()
                    compileFile(entry.basename,entry.fullPath, config.dest, parameters, obfuscate, config.obfuscationParameters);
                })
                .on('warn', error => console.error('non-fatal error', error))
                .on('error', error => console.error('fatal error', error))
                .on('end', () => {
                });
        } else {
            throw new Error("No destination specified. Add buildConfig.dest in package.json");
        }
    } else {
        throw new Error("No source specified. Add buildConfig.src in package.json");
    }
}

let procargs:string[] = process.argv;
for (let i = 0; i < 2; i++) {
    procargs.shift();
}

main(procargs);
