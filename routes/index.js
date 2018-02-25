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
  if (req.session.location == 0 || req.session.location == undefined) {
    var sql = "select num,latitude,longitude,title,location,content,article.id as id,name,date from article join user where article.id = user.id order by num desc limit 12"
    var arr = []
  }else{
    var sql = "select num,latitude,longitude,title,location,content,article.id as id,name,date from article join user where article.id = user.id and location=? order by num desc limit 12"
    var arr = [req.session.location]
  }

  //to get articls through mysql
  //TODO : Separate two query statement 
  pool.getConnection((err, conn)=>{
    if(err) { console.log(err); return next(); }
    conn.query(sql, arr, (err, result)=>{
      conn.release();
      if(err) { console.log(err); return next(); }
      obj.articles = result
      if(result.length == 0) {
        obj.articles = JSON.stringify(obj.articles)
        res.render('index', obj);
      }else{
        var leng=result.length
        for(i=0; i<result.length;i++){
          ((i)=>{
            obj.articles[i].partin = ""
            var sql = "select name from participant join user where num=? and participant.id = user.id"
            var arr = [result[i].num]
            pool.getConnection((err, conn)=>{
              if(err) { console.log(err); return next(); }
              conn.query(sql, arr, (err, result)=>{
                conn.release();
                if(err) { console.log(err); return next(); }
                var str =[]
                for(j=0;j<result.length;j++){
                  str.push(result[j].name)
                }
                obj.articles[i].partin = str.join(", ")
                console.log("joinpeoplelog : "+obj.articles[i].partin+i)
                if(--leng == 0){
                  console.log("this is redering")
                  obj.articles = JSON.stringify(obj.articles)
                  res.render('index', obj);
                }
              });
            });
          })(i)
        }
      }
    });
  });
});

/* POST location information and reload */
router.post('/', function(req, res) {
  req.session.location = req.body.location
  res.redirect('/');
});

/* GET Signin form */
router.get('/signin', (req,res,next)=>{
  res.render('signin');
});

/* POST Signin ID & password */
router.post('/signin', (req,res,next)=>{
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
 * Post write 
 */
router.post('/write', (req,res,next)=>{
  let title = req.body.title;
  let location = req.body.location;
  let content = req.body.content.replace(/\r\n/gm,"<br>").replace(/\n/gm,"<br>");
  let lati = req.body.latvalue;
  let long = req.body.lngvalue;

  if(req.session.userid != undefined){
    var id = req.session.userid;
  }else{
    res.send("<script>alert('로그인 후에 글을 작성해주세요.'); history.back();</script>")
  }
  let sql = "insert into article(title,location,content,id,latitude,longitude,date) values(?,?,?,?,?,?,now())";
  let arr = [title, location, content, id,lati,long]
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

/**
 * join group
 */
router.post('/joinin', (req,res,next)=>{
  let num = req.body.num;
  let id = req.body.id;
  if(req.session.userid != undefined){
  }else{
    res.send("<script>alert('로그인 후에 참가신청을 해주세요.'); history.back();</script>")
  }
  let sql = "insert into participant(num,id,date) values(?,?,now())";
  let arr = [num,id]
  pool.getConnection((err, conn) => {
    if(err) { console.log(err); return next(); }
    conn.query(sql, arr, (err, result)=>{
      conn.release();
      if(err) { console.log(err); return next(); }
      res.redirect('/');
    });
  });
});

/* kakao chat bot api control*/
router.get('/keyboard', (req,res,next)=>{
  let obj = {
    "type":"buttons",
    "buttons" : ["1","2","3"]
  }
  res.send(obj)
})

module.exports = router;
