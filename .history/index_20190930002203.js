var express = require("express");
var app = express();
app.listen(3000, () => {
    console.log("Server running on port 3000");
});


app.get("/resetIp", await (req, res, next) => {
    res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});