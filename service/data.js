var fs = require('fs');
const XLSX = require("xlsx");
const ExcelJS = require('exceljs');
async function writeFileExcel(data){
    const workbook = new ExcelJS.Workbook();
    var worksheet = workbook.addWorksheet('ip');

    data.forEach(element => {
        worksheet.addRow(element).commit();
    });

  await workbook.xlsx.writeFile('tezx.xlsx');
}
 module.exports =  writeFileExcel;