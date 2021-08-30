const express = require('express');
const fs = require('fs');
const app = express();
app.locals.pretty = true;
app.set('views', './views_mysql');
app.set('view engine', 'jade');

let mysql = require('mysql');
let conn = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'1234',
  database:'o2',
});

//conn.connect();

app.use(express.json());
app.use(express.urlencoded({extends:true}));

app.post('/topic/add', (req, res)=>{
  let title = req.body.title;
  let description = req.body.description;
  let author = req.body.author;

  let sql = 'INSERT INTO topic (title,description,author) VALUES (?, ?, ?)';
  conn.query(sql, [title, description, author],(err, result, fields)=>{
    if(err){
      res.status(500).send('Internal server error!');
    }

    res.redirect('/topic/'+result.insertId)});
})

app.get('/topic/add', (req, res)=>{
  let sql = 'SELECT id, title FROM topic';
  conn.query(sql, (err, topics, fields)=>{
    if(err){
      res.status(500).send('Internal server error!');
    }
    res.render('add', {topics:topics});
  })
});

app.post('/topic/:id/edit', (req, res)=>{
  let title = req.body.title;
  let description = req.body.description;
  let author = req.body.author;

  let sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';
  let id = req.params.id;
  conn.query(sql, [title, description, author, id], (err, rows, fields)=>{
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error!');
    }
    else
      res.redirect('/topic/'+id);
  })
});


app.get('/topic/:id/edit', (req, res)=>{
  let sql = 'SELECT id,title,description FROM topic';
  
  conn.query(sql, (err, topics, fields)=>{
    let id = req.params.id;
    if(id){
      let sql = 'SELECT * FROM topic where id=?';
      conn.query(sql, [id], (err, topic, fields)=>{
        if(err){
          console.log(err);
          res.status(500).send('Internal server error!');
        }
        res.render('edit', {topics:topics, topic:topic[0]});
      })
    }
    else{
      console.log('There is no id!');
      res.status(500).send('Internal Server Error!');
    }
  })
})

app.get('/topic/:id/delete', (req, res)=>{
  let id = req.params.id;
  let sql = 'SELECT * FROM topic';

  conn.query(sql, (err, rows, fields)=>{
    let sql = 'SELECT * FROM topic WHERE id=?';
    conn.query(sql, id, (err, topic, fields)=>{
      if(err){
        console.log(err);
        res.status(500).send('Internal Server error!');
      }
      else{
        if(topic.length === 0){
          console.log('There is no record!!');
          res.status(500).send('Internal Server Error!');
        }
        else{
          res.render('delete', {topics:rows, topic:topic[0]});
        }
      }
    })
  })
});

app.post('/topic/:id/delete', (req, res)=>{
  let id = req.params.id;
  let YesOrNo = req.body.delete;

  if(YesOrNo == 'Y'){
    let sql = 'DELETE FROM topic WHERE id=?'
    conn.query(sql, [id], (err, rows, fields)=>{
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error!');
      }
      console.log('Success deleting!!');
      res.redirect('/topic');
    })
  }
  else{
    res.redirect('/topic');
  }
})


app.get(['/topic', '/topic/:id'], (req, res)=>{
  // readdir은 토픽이 있던 없던 간에 표현이 되어야함
  let sql = 'SELECT id,title,description FROM topic';
  
  conn.query(sql, (err, topics, fields)=>{
    let id = req.params.id;
    if(id){
      let sql = 'SELECT * FROM topic where id=?';
      conn.query(sql, [id], (err, topic, fields)=>{
        if(err){
          console.log(err);
          res.status(500).send('Internal server error!');
        }
        res.render('view', {topics:topics, topic:topic[0]});
      })
    }
    else{
      res.render('view', {topics:topics});
    }
  })
})

app.post('/topic', (req, res)=>{
  let title = req.body.title;
  let description = req.body.description;
  // 이 아래 코드를 async하게 바꾸려면 어떻게 해야 하는가?
  fs.writeFile(__dirname + `/data/${JSON.stringify(req.body.title).replace(/["]+/g, '')}`
  ,JSON.stringify(req.body.description).replace(/["]+/g, ''), (err)=>{
    if(err){
      console.log(err);
      res.status(500).send('Internal server error!');
    }
    //res.send("<script>alert('Success!!')</script>");
    res.redirect('/topic/'+title);
  });
  
})

//conn.end();

app.listen(3000, ()=>{
  console.log('Port 3000 is connected!');
})

