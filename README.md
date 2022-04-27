# build-tool

A javascript / typescript preprocessor, with features comparable to gcc's.

**DISCLAIMER**

This tool is for personal use, so error and edge-cases handling are NOT prioritary.

Technical support is NOT guaranteed to be provided.

The documentation is currently incomplete.

## Usage

TODO

## Configuration

`build-config.json`:

```json
{
    "src": "test/src/",
    "dest": "test/dest/",
    "obfuscate": "build",
    "parameters": [
        "dev"
    ],
    "obfuscationParameters": {
        // javascript-obfuscator parameters
    }
}
```

## Code obfuscation

## Syntax

See test/src/main.js for usage *in situ*.

The used prefix is //#

### //# define

`//# define CONSTANT_NAME CONSTANT_VALUE` 

 - CONSTANT_NAME
 - CONSTANT_VALUE

TODO

### //# if FLAG, //# endif FLAG

TODO
