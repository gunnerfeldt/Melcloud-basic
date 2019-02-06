var request = require("request");
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
function Melcloud(login) {
    var email = login.email;;
    var password = login.password;;
    var ContextKey = null;
    var UseFahrenheit = null;
    var DeviceID = null;
    var BuildingID = null;
    const bitFlags = {
        Power: 1,
        OperationMode: 2,
        SetTemperature: 4,
        SetFanSpeed: 8
    }

    var log = function(str) {
        console.log(str);
    }
    var me = this;

    this.get = new Promise(function(resolve, reject) {
        let url = "https://app.melcloud.com/Mitsubishi.Wifi.Client/Login/ClientLogin";
        let form = {
            AppVersion: "1.9.3.0",
            CaptchaChallenge: "",
            CaptchaResponse: "",
            Email: email,
            Language: "23",
            Password: password,
            Persist: "true"
        };
        let method = "post";

        request({
            url: url,
            form: form,
            method: method
        }, function(err, response) {
            if (err) {
                log("There was a problem sending login to: " + url);
                log(err);
                callback([]);
            } else {
                let r = eval("(" + response.body + ")");
                ContextKey = r.LoginData.ContextKey;
                UseFahrenheit = r.LoginData.UseFahrenheit;

                let url = "https://app.melcloud.com/Mitsubishi.Wifi.Client/User/ListDevices";
                request({
                    url: url,
                    method: "get",
                    headers: {
                        "X-MitsContextKey": ContextKey
                    }
                }, function(err, response) {
                    if (err) {
                        log("There was a problem getting devices from: " + url);
                        log(err);
                    } else {
                        let buildings = eval("(" + response.body + ")");
                        let device = buildings[0].Structure.Devices[0];
                        let url = "https://app.melcloud.com/Mitsubishi.Wifi.Client/Device/Get?id=" + device.DeviceID + "&buildingID=" + device.BuildingID;
                        request({
                            url: url,
                            method: "get",
                            headers: {
                                "X-MitsContextKey": ContextKey
                            }
                        }, function(err, response) {
                            if (err || response.body.search("<!DOCTYPE html>") != -1) {
                                log("There was a problem getting info from: " + url);
                                log("for device: ");
                                log("Error: " + err);
                            } else {
                                resolve(eval("(" + response.body + ")"));
                            }
                        });
                    }
                });
            }
        });
    });

    this.set = function(param) {
        return new Promise(function(resolve, reject) {
            me.get.then((msg) => {
                let EffectiveFlags = 0;
                Object.keys(param).forEach(key => {
                    EffectiveFlags += bitFlags[key];
                    msg[key] = param[key]
                    msg.HasPendingCommand = true;
                });
                msg.EffectiveFlags = EffectiveFlags;

                var url = "https://app.melcloud.com/Mitsubishi.Wifi.Client/Device/SetAta";
                resolve(msg);
                request({
                    url: url,
                    method: "post",
                    body: JSON.stringify(msg),
                    headers: {
                        "X-MitsContextKey": ContextKey,
                        "content-type": "application/json"
                    }
                }, function(err, response) {
                    if (err) {
                        log("There was a problem setting info to: " + url);
                        log(err);
                    } else {
                        resolve(msg);
                    }
                });
            });
        });
    }
}

module.exports = Melcloud;
