const express = require("express");
const app = express();

const resetIp = require('./service/resetIp');
app.get('/reset', (req, res) => {
    try {
        resetIp();
    } catch (error) {
        
    }
    
  });

app.listen(3000, () => {
    console.log("Server running on port 3000");
});