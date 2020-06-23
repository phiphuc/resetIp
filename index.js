const express = require("express");
const app = express();
const service = require('./service/data');
const resetIp = require('./service/resetIp');

const path = require('path'); 
const e = require("express");
const filePath = path.join(__dirname, 'ip.xlsx');

app.get('/reset', async (req, res) => {
    try {
        //await data.createFileExcel(filePath);
        const ip = await resetIp();
        return res.json({status: 0, message: 'Reset success', ip: ip});
    } catch (error) {
        return res.json({status: 1, message: 'Reset fail'});
    }
  });

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
// let data = [];
// async function main(){
//    try {
//     let count  = 0;
//     while(count < 100 && data){
//         const ip = await resetIp();
//         if(ip.includes('error')){
//             continue;
//         }
//         if(data.includes(ip)){
//             console.log("Count: "+count);
//             count += 1;
//         }else{
//             data.push(ip);
//         }
        
//     }
//     await service(data);
//    } catch (error) {
//     main();
//    }
// }
// main();
