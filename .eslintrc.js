module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "Game": "readonly",
        "Memory": "readonly",
        "_": "readonly",
        "Room": "readonly",
        "Creep": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "no-undef": "warn",
        "no-redeclare": "off"
    }
};