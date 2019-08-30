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
app.get("/main2", function(req,res){
	res.render("main2");
})
app.get('/login', function(req, res){
    res.render('login');
  })
  
app.get('/hostCreateQr', function(req, res){
    res.render('hostCreateQr');
})
  
app.get("/qrcodeReader", function(req,res){

    res.render("qrTest");
})

app.get("/qrTicketReader", function(req,res){
    res.render("qrTestTicket");
})

app.get("/mealQr", function(req,res){
    res.render("mealQr");
})
app.get("/signup", function(req, res){
    res.render("signup");
})
app.get("/withdrawQR", function(req, res){
    res.render("withdrawQR");
})

app.get("/deposit", function(req,res){
    res.render("deposit");
})

app.get("/guestList", function(req, res){
    res.render("guestList");
})

app.post("/guestList", function(req,res){
    var keynum = req.body.keynum
    var sql = "SELECT * FROM qrpay WHERE keynum = ?"
    connection.query(sql,[keynum], function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            console.log(result);
            res.json(result);
      }
    });
})

app.post("/update", function(req,res){
    var name = req.body.name;
    var sql = "UPDATE `fintech`.`user` SET flag=1 WHERE name = ?"
    connection.query(sql,[name], function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            res.json(1);
      }
    });
})

app.post("/checkTicket", function(req,res){
    var name = req.body.name;
    var sql = "SELECT * FROM user WHERE name = ?"
    connection.query(sql,[name], function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            console.log(result[0].flag);
            res.json(result[0].flag);
      }
    });
})

app.post("/updateTicket", function(req,res){
    var name = req.body.name;
    var sql = "UPDATE `fintech`.`user` SET flag=2 WHERE name = ?"
    connection.query(sql,[name], function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            res.json(1);
      }
    });
})
app.post("/check", function(req, res){
    var id = 1;
    var sql = "SELECT * FROM marrieduser WHERE id = ?"
    connection.query(sql,[id], function(err, result){
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
    var amount = req.body.amount;
    var coment = req.body.coment;
    var sql = "SELECT * FROM user WHERE name = ?"
    var sql2 = "INSERT INTO `fintech`.`qrpay`(`name`, `amount`, `coment`) "
    + "VALUES (?,?,?)"
    connection.query(sql,[name], function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            var option = {
                method : "POST",
                url :'https://testapi.open-platform.or.kr/transfer/withdraw',
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken,
                    'Content-Type' : 'application/json; charset=UTF-8'
                },
                json : {
                    dps_print_content : coment,
                    fintech_use_num : '199158809057879734285815',
                    tran_amt : amount,
                    tran_dtime : '20190829135600'
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    //console.log(body);
                    //res.json(body);
                    connection.query(sql2, [name, amount, coment], function(err, result){
                        console.log(result);
                        if(err){
                            console.error(err);
                            throw err;
                        }
                        else{
                            res.json(1);
                        }
                    });

                }
            })
      }
    });
    
})

app.post('/deposit', function(req, res){
    var sql = "select sum(amount) from money"
    connection.query(sql,function(err, result){
        if (err) {
            console.log(err);
            throw err;  
        }
        else {
            var option = {
                method : "POST",
                url :'https://testapi.open-platform.or.kr/v1.0/transfer/deposit2',
                headers : {
                    'Authorization' : 'Bearer fc000e61-6fca-45d3-b3e8-cb95bc014a83', //혼주 accessToken
                    'Content-Type' : 'application/json; charset=UTF-8'
                },
                json : {
                    wd_pass_phrase: "NONE",
                    wd_print_content: "환불금액",
                    name_check_option : "on",
                    req_cnt: "1",
                    req_list: [
  	                    {   tran_no: "1", 
  	                        bank_code_std: "002", 
  	                        account_num: "3333100441044", //혼주 계좌
  	                        account_holder_name: "김자연", //혼주 이름
  	                        print_content: "쇼핑몰환불", 
  	                        tran_amt: "80000" } //축의금 총 금액 (여기에 sql 결과값 삽입)
  	                ],
                    tran_dtime : "20190828182727"
                }
            };

            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    console.log(body);
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

app.post('/signup', function(req, res){
    var name = req.body.nameinput;
    var password = req.body.passwordinput;
    var accessToken = req.body.tokeninput;
    var seqnum = req.body.seqnuminput;
    var sql = "INSERT INTO `fintech`.`user`(`name`, `password`, `accessToken`,`userseqnum`)"
    + "VALUES (?,?,?,?)"    
    connection.query(sql, [name, password, accessToken, seqnum], function(err, result){
        console.log(this.sql);
        if(err){
            console.error(err);
            throw err;
        }
        else {
            res.json(1);
        }
    })
  })
  
  app.get('/callback', function(req, res){
    var auth_code = req.query.code
    var getTokenUrl = "https://testapi.open-platform.or.kr/oauth/2.0/token";
    var option = {
        method : "POST",
        url :getTokenUrl,
        headers : {
        },
        form : {
            code : auth_code,
            client_id : "l7xx1ce33c1b22ff4b828d6ed1205e308d56",
            client_secret : "782e68e841d949a6b19143e61d870255",
            redirect_uri : "http://localhost:3000/callback",
            grant_type : "authorization_code"
        }
    };
    request(option, function(err, response, body){
        if(err) throw err;
        else {
            console.log(body);
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult);
            res.render('resultChild', {data : accessRequestResult})
            
        }
    })
  })
  
  app.get('/getUserData', function(req, res){
      var getTokenUrl = "https://testapi.open-platform.or.kr/user/me?user_seq_no=1100035354";
      var option = {
          method : "GET",
          url :getTokenUrl,
          headers : {
              Authorization : "Bearer 3f6de561-522d-4c16-94b7-c7ad97da19b2"
          }
      };
      request(option, function(err, response, body){
          if(err) throw err;
          else {
              var sbody=body.split(',');
              for(var i in sbody){
                  console.log(sbody[i]+'\n');
              }
          }
      })
  })
  
  app.get('/getUser', auth, function(req, res){
      var userId = req.decoded.userId;
      console.log(req.decoded);
      var sql = "SELECT * FROM user WHERE id = ?"
      connection.query(sql,[userId], function(err, result){
          var userseqnum = result[0].userseqnum;
          var accessKey = result[0].accessKey;
          var getTokenUrl = "https://testapi.open-platform.or.kr/user/me?user_seq_no="+userseqnum;
          var option = {
              method : "GET",
              url :getTokenUrl,
              headers : {
                  Authorization : "Bearer " + accessKey
              }
          };
          request(option, function(err, response, body){
              if(err) throw err;
              else {
                  console.log(body);
                 var gr=res.json(body);
                  res.render('resultChild2', {data : gr})
              }
          })
      
      });
  })
  
  app.post('/login', function(req, res){
      var userEmail = req.body.userEmail;
      var userPassword = req.body.password;
      console.log(userEmail, userPassword);
      var sql = "SELECT * FROM user WHERE name = ?";
      connection.query(sql, [userEmail, userPassword], function(err, results){
          if(err){
              throw err;
          }
          else {
              if(results.length > 0){
                  var tokenKey = "asdfgqwertasdf"
                  if(results[0].password == userPassword){
                      jwt.sign(
                          {
                              userName : results[0].name,
                              userId : results[0].id
                          },
                          tokenKey,
                          {
                              expiresIn : '1d',
                              issuer : 'fintech.admin',
                              subject : 'user.login.info'
                          },
                          function(err, token){
                              console.log('로그인 성공', token)
                              res.json(token)
                          }
                      )
                  }
              }
          }
      })
  })
  
app.listen(3000);