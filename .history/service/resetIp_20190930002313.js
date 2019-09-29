const request = require('request');
const js2xmlparser = require("js2xmlparser");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const constants = require('../constants/constans');
const encryp = require('../lib/encryption');
function getCookie(){
    return new Promise((res, rej) => {
        request(constants.URL_HOME, (err, response, body) => {
            if(err) return rej(err);
            return res(response.headers['set-cookie'][0]);
        })
    })
}

function sesTokInfo(cookie){
    const headers = {
        Cookie: cookie,
        'User-Agent': constants.User_Agent_Value
    }
    return new Promise((res, rej) => {
        request({url:constants.URL_SES_TOK_INFO, headers}, (err, response, body) => {
            if(err) return rej(err);
            const dom = new JSDOM(body);
            const result = {
                SesInfo: dom.window.document.querySelector("SesInfo").textContent,
                TokInfo: dom.window.document.querySelector("TokInfo").textContent,
            }
            return res(result);
        })
    })
}

function challengeLogin(cookie, data){
    const headers = {
        'Cookie': cookie,
        'User-Agent': constants.User_Agent_Value,
        '__RequestVerificationToken': data.TokInfo,
        'Content-Type':'application/x-www-form-urlencoded'
    }
    
    const body ='<?xml version="1.0" encoding="UTF-8"?><request><username>admin</username><firstnonce>'+data.firstnonce+'</firstnonce><mode>1</mode></request>';

    return new Promise((res, rej) => {
        request({url:constants.URL_CHALLENGE_LOGIN, headers, body, method: 'POST'}, (err, response, body) => {
            if(err) return rej(err);
            const dom = new JSDOM(body);
            if(dom.window.document.querySelector("error") !== null){
                return rej(err)
            }
            const result = {
                salt: dom.window.document.querySelector("salt").textContent,
                iterations: dom.window.document.querySelector("iterations").textContent,
                servernonce: dom.window.document.querySelector("servernonce").textContent,
                modeselected: dom.window.document.querySelector("modeselected").textContent,
                newType: dom.window.document.querySelector("newType").textContent,
                newIterations: dom.window.document.querySelector("newIterations").textContent,
                newSalt: dom.window.document.querySelector("newSalt").textContent,
                requestverificationtoken: response.headers['__requestverificationtoken']
            }
            return res(result);
        })
    })  
}

function authenticationLogin(cookie, data){
    const headers = {
        'Cookie': cookie,
        'User-Agent': constants.User_Agent_Value,
        '__RequestVerificationToken': data.requestverificationtoken,
        'Content-Type':'application/x-www-form-urlencoded'
    }

    const body = '<?xml version="1.0" encoding="UTF-8"?><request><clientproof>'+data.clientProof+'</clientproof><finalnonce>'+data.finalNonce+'</finalnonce></request>'
    return new Promise((res, rej) => {
        request({url:constants.URL_AUTHEN_LOGIN, headers, body, method: 'POST'}, (err, response, body) => {
            if(err) return rej(err);
            const dom = new JSDOM(body);
            const result = {
                requestverificationtoken: response.headers['__requestverificationtokenone'],
                cookie: response.headers['set-cookie'][0]
            }
            return res(result);
        })
    })  
}

function dataSwitch(data, connect){
    const headers = {
        'Cookie': data.cookie,
        'User-Agent': constants.User_Agent_Value,
        '__RequestVerificationToken': data.requestverificationtoken,
        'Content-Type':'application/x-www-form-urlencoded'
    }
    const body = '<?xml version="1.0" encoding="UTF-8"?><request><dataswitch>'+connect+'</dataswitch></request>'
    return new Promise((res, rej) => {
        request({url:constants.URL_DATA_SWITCH, headers, body, method: 'POST'}, (err, response, body) => {
            if(err) return rej(err);
            const dom = new JSDOM(body);
            const result = {
                requestverificationtoken: response.headers['__requestverificationtoken'],
            }
            return res(result);
        })
    })  
}

 async function resetIp(){
    console.time('someFunction');
    const cookie = await getCookie();
    let sesTokInfoData = await sesTokInfo(cookie);
    const firstnonce = encryp.genFirstNonce().toString();

    sesTokInfoData.firstnonce = firstnonce;

    let challengeLoginData = await challengeLogin(cookie, sesTokInfoData);
    challengeLoginData.firstNonce = firstnonce;
    let encrypData = encryp.encrypData(challengeLoginData);
    encrypData.requestverificationtoken = challengeLoginData.requestverificationtoken;
    let authenticationLoginData = await authenticationLogin(cookie, encrypData);
    // 1 là kết nối, 0 là ngắt kết nối.
    let connect = 0;
    const turnOff = await dataSwitch(authenticationLoginData, connect);
    authenticationLoginData.requestverificationtoken = turnOff.requestverificationtoken;
    connect = 1;
    await dataSwitch(authenticationLoginData, connect);
    console.timeEnd('someFunction');

    //checkIp();

};

module.exports = resetIp

function checkIp(){
    request('https://api.ipgeolocation.io/ipgeo?apiKey=4879be9e54ef4fe8998c1023fb8b501a', (err, res, body) => {
        console.log(JSON.parse(body).ip)
    })
}