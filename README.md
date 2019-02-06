# Melcloud-basic
Super simple Melcloud interface for node.js. Not suitable if you have multiple units.

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
