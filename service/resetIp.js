const request = require('request');
const js2xmlparser = require("js2xmlparser");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var http = require('http');

const utils = require('../Utils/utils');
const encryp = require('../lib/encryption');
function getCookie(){
    return new Promise((res, rej) => {
        request(utils.URL_HOME, (err, response, body) => {
            if(err) return rej(err);
            const dom = new JSDOM(body);
            // đoạn này cần check bên tool wifi có null không. đây đang viết cho dcom 4g 
            const csrf= dom.window.document.getElementsByName('csrf_token')[1].content;
            return res({cookie: response.headers['set-cookie'][0], csrf: csrf});
        })
    })
}

function sesTokInfo(cookie){
    const headers = {
        Cookie: cookie,
        'User-Agent': utils.User_Agent_Value
    }
    return new Promise((res, rej) => {
        request({url:utils.URL_SES_TOK_INFO, headers}, (err, response, body) => {
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
        'User-Agent': utils.User_Agent_Value,
        '__RequestVerificationToken': data.TokInfo,
        'Content-Type':'application/x-www-form-urlencoded'
    }
    
    const body ='<?xml version="1.0" encoding="UTF-8"?><request><username>admin</username><firstnonce>'+data.firstnonce+'</firstnonce><mode>1</mode></request>';

    return new Promise((res, rej) => {
        request({url:utils.URL_CHALLENGE_LOGIN, headers, body, method: 'POST'}, (err, response, body) => {
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
        'User-Agent': utils.User_Agent_Value,
        '__RequestVerificationToken': data.requestverificationtoken,
        'Content-Type':'application/x-www-form-urlencoded'
    }

    const body = '<?xml version="1.0" encoding="UTF-8"?><request><clientproof>'+data.clientProof+'</clientproof><finalnonce>'+data.finalNonce+'</finalnonce></request>'
    return new Promise((res, rej) => {
        request({url:utils.URL_AUTHEN_LOGIN, headers, body, method: 'POST'}, (err, response, body) => {
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
        'User-Agent': utils.User_Agent_Value,
        '__RequestVerificationToken': data.requestverificationtoken,
        'Content-Type':'application/x-www-form-urlencoded'
    }
    const body = '<?xml version="1.0" encoding="UTF-8"?><request><dataswitch>'+connect+'</dataswitch></request>'
    return new Promise((res, rej) => {
        request({url:utils.URL_DATA_SWITCH, headers, body, method: 'POST'}, (err, response, body) => {
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
     // tạm harcode để test case 4g
     const _isDcom = true;
     let ip  = "";
    try {
    console.time('resetIp');
    const dataHome = await getCookie();

    const cookie = dataHome.cookie;
    const csrf = dataHome.csrf;
    let authenticationLoginData = {
        cookie: dataHome.cookie,
        requestverificationtoken: csrf
    }
    if(!_isDcom){
        let sesTokInfoData = await sesTokInfo(cookie);
        const firstnonce = encryp.genFirstNonce().toString();
    
        sesTokInfoData.firstnonce = firstnonce;
    
        let challengeLoginData = await challengeLogin(cookie, sesTokInfoData);
        challengeLoginData.firstNonce = firstnonce;
        let encrypData = encryp.encrypData(challengeLoginData);
        encrypData.requestverificationtoken = challengeLoginData.requestverificationtoken;
        authenticationLoginData = await authenticationLogin(cookie, encrypData);
    }
    
    // 1 là kết nối, 0 là ngắt kết nối.
    let connect = 0;
    const turnOff = await dataSwitch(authenticationLoginData, connect);
    authenticationLoginData.requestverificationtoken = turnOff.requestverificationtoken;
    connect = 1;
    await dataSwitch(authenticationLoginData, connect);
    console.timeEnd('resetIp');
    await sleep(3000);
    ip = await checkIp();
    } catch (error) {
        console.log("LOI :"+error);
        console.timeEnd('resetIp');
    }
    return ip;
};

let count = 0;
 function checkIp(){
   return new Promise((res, rej) => {
    request('http://api.ipify.org/', (err, response, body) => {
        if(err){console.log(err); return rej(err)}
        try{
            if(!body.includes('error')){
                count +=1;
            }
            console.log(count+ " : " +body);
        }catch(err){
            console.log("Lỗi: "+err);
        }
        return res(body);
    })
   })
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

module.exports = resetIp