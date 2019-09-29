const express = require("express");
const app = express();

const resetIp = require('./service/resetIp');
app.get('/reset', (req, res) => {
    try {
        resetIp();

    } catch (error) {
        return res.json({status: 1, message: ''});
    }
    
  });

app.listen(3000, () => {
    console.log("Server running on port 3000");
});