var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 100,
  host            : 'localhost',
  user            : 'root',
  password        : 'qkqh7083',
  database        : 'cyclist'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  var obj = { 
    "userid": req.session.userid,
    "location": req.session.location,
    "name": req.session.name,
  }
  console.log(obj)
  if(req.session.location != undefined){
    var sql = "select * from article where location=? order by num desc limit 12"
    var arr = [req.session.location]
  }else{
    var sql = "select * from article order by num desc limit 12"
    var arr = []
  }
  pool.getConnection((err, conn)=>{
    if(err) { console.log(err); return next(); }
    conn.query(sql, arr, (err, result)=>{
      conn.release();
      if(err) { console.log(err); return next(); }
      obj.articlenum = result.length
      obj.articles = result
      console.log(obj.articles)
      res.render('index', obj);
    });
  });
});

/* POST location information and reload */
router.post('/', function(req, res) {
  console.log(req.body.location)
  req.session.location = req.body.location
  res.redirect('/');
});

/* GET Signin form */
router.get('/signin', (req,res,next)=>{
  res.render('signin');
});

/* POST Signin ID & password */
router.post('/signin', (req,res,next)=>{
  console.log(req.body)
  var id = req.body.id;
  var password = req.body.password;
  var sql = "select * from user where id=?";
  var arr = [id]
  pool.getConnection((err, conn)=>{
    if(err) { console.log(err); return next(); }
    conn.query(sql, arr, (err, result)=>{
      conn.release();
      if(err) { console.log(err); return next(); }
      if(result.length == 0){
        res.send("<script>alert('ID가 존재하지 않습니다.'); history.back();</script>")
      }else if(result[0].password == password){
        req.session.userid = id;
        req.session.name = result[0].name;
        res.redirect('/');
      }else{
        res.send("<script>alert('비밀번호가 일치하지 않습니다.'); history.back();</script>")
      }
    });
  });  
});

/* GET Signup form */
router.get('/signup', (req,res,next)=>{
  res.render('signup', {});
});

/**
 * POST sign up request
 */
router.post('/signup', (req,res,next)=>{
  console.log('req.boby=', req.body);
  var id = req.body.id;
  var password = req.body.password;
  var name = req.body.name;
  var sql = "insert into user(id,password,name,regdate) values(?,?,?,now())";
  var arr = [id,password,name]
  pool.getConnection((err, conn) => {
    if(err) { console.log(err); return; }
    conn.query(sql, arr, (err, result)=>{
      conn.release();
      if(err) { console.log(err); return; }
      req.session.userid = id;
      req.session.name = name;
      res.redirect('/');
    });
  });
});

/**
 * GET write form
 */
router.post('/write', (req,res,next)=>{
  let title = req.body.title;
  let location = req.body.location;
  let content = req.body.content;
  if(req.session.userid != undefined){
    var id = req.session.userid;
  }else{
    res.send("<script>alert('로그인 후에 글을 작성해주세요.'); history.back();</script>")
  }
  let sql = "insert into article(title,location,content,id,date) values(?,?,?,?,now())";
  let arr = [title, location, content, id]
  pool.getConnection((err, conn) => {
    if(err) { console.log(err); return next(); }
    conn.query(sql, arr, (err, result)=>{
      conn.release();
      if(err) { console.log(err); return next(); }
      res.redirect('/');
    });
  });
});


/* logout */
router.get('/logout', (req,res,next)=>{
  req.session.destroy();
  res.redirect('/');
});
module.exports = router;
