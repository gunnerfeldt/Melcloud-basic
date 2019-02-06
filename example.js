const melClass = require("./mel.js");

/*
set login at construction 
    {email: "your user EMAIL/login", password: "your PASSWORD"}

methods: 

    get -
        no argument
        resolves full object from Melcloud

    set -
        argument: object with matching keys
            Power
            OperationMode
            SetTemperature
            SetFanSpeed
            .. should be more?
        resolves full object from Melcloud (with new settings injected)
*/

const mel = new melClass({
    email: "YOUR EMAIL",
    password: "YOUR PASSWORD"
})

// get current settings from MelCloud
mel.get.then((msg) => {
    console.log(msg);
});

// set new settings to MelCloud
mel.set({
    SetTemperature: 12,
    OperationMode: 1
}).then((msg) => {
    console.log(msg);
});
