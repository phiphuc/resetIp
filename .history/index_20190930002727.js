const express = require("express");
const app = express();

const resetIp = require('./service/resetIp');
app.get('/reset', (req, res) => {
    return res.send('Received a GET HTTP method');
  });

app.listen(3000, () => {
    console.log("Server running on port 3000");
});