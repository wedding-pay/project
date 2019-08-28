const express = require("express");
const app = express();
var path = require("path");
var mysql = require('mysql');
var request = require('request');
var jwt = require('jsonwebtoken');
var QrCode = require('qrcode-reader');
var auth = require('./auth');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'fintech'
});

connection.connect();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname+'/public')));

app.get("/main", function(req,res){
	res.render("main");
})

app.get("/qrcodeReader", function(req,res){
    res.render("qrTest");
    //res.render("qrcodeReader");
})

app.get("/withdrawQR", function(req, res){
    res.render("withdrawQR");
})

app.get("/myaccount", function(req, res){
    res.render("myaccount");
})

app.post("/check", function(req, res){
    // db select
    // var name = req.body.qrFin.name
    var name = "LEE";
    var sql = "SELECT * FROM mperson WHERE name = ?"
    connection.query(sql,[name], function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            console.log(result[0]);
            res.json(result[0]);
      }
    });
})

app.post('/withdrawQR', function(req, res){
    var name = req.body.name;
    var money = req.body.money;
    var coment = req.body.coment;
    var sql = "SELECT * FROM user WHERE name = ?"
    connection.query(sql,[name], function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            console.log(result[0]);
            var option = {
                method : "POST",
                url :'https://testapi.open-platform.or.kr/transfer/withdraw',
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken,
                    'Content-Type' : 'application/json; charset=UTF-8'
                },
                json : {
                    dps_print_content : coment,
                    fintech_use_num : '199158809057879734275023',
                    tran_amt : money,
                    tran_dtime : '20190523101921'
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    if(body.rsp_code == "A0000"){
                        alert(body);
                        res.json(1);
                    }
                    else {
                        res.json(2);
                    }
                }
            })
      }
    });
})

/*
app.post("/withdrawQR", function(req,res){
    var name = 'hanul';
    var finNum = req.body.qrFin;
    var sql = "SELECT userseqnum, accessToken FROM user WHERE name = ?";
    connection.query(sql,[name], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result[0]);
            var option = {
                method : "POST",
                url :'https://testapi.open-platform.or.kr/transfer/withdraw',
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken,
                    'Content-Type' : 'application/json; charset=UTF-8'
                },
                json : {
                    dps_print_content : '널앤서',
                    fintech_use_num : finNum,
                    tran_amt : 11000,
                    print_content : '널앤서',
                    tran_dtime : '20190523101921'
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    if(body.rsp_code == "A0000"){
                        res.json(1);
                    }
                    else {
                        res.json(2);
                    }
                }
            })
        }
    })
})*/

app.listen(3000);