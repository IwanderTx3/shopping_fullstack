const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')

var bodyParser = require('body-parser')
var session = require('express-session')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.engine('mustache', mustacheExpress())
// setting up middleware to use the session
app.use(session({
  secret: 'hobbit',
  resave: false,
  saveUninitialized: false
}))
app.use(express.static('public'))
//let option = {
//    promiselib: promise
//}

let pgp = require('pg-promise')()
let connectionString = 'postgres://localhost:5432/shoppinglists'
let db = pgp(connectionString)
app.set('views','./views')
app.set('view engine','mustache')
app.get('/home',function(req,res) {
    db.any('SELECT storename, storeid FROM stores').then(function(data){
    res.render('home',{shoppingList : data})})})


app.get('/', function(req,res) {res.render('index')})
app.get('/lists',function(req,res) {res.render('lists')})
app.get('/list',function(req,res) {res.redirect('lists')})
app.get('/lists/:storeid',function(req,res) {
    db.one('SELECT storename, storeid FROM stores WHERE storeid=$1 ', [req.params.storeid])
    .then(function(store){
        db.any('SELECT productname,quantity FROM items WHERE storeid=$1 ', [req.params.storeid])
        .then(function(data)
        {
        console.log(data)
        res.render('lists',{storename: store.storename, storeid:store.storeid, itemList: data} )})})
    
})


app.post('/lists/store',function(req,res) {
    let productname = req.body.productname
    let quantity = req.body.quantity
    let storeid = req.body.storeid
    db.any('INSERT INTO items(productName,quantity,storeid) VALUES($1,$2,$3)',[productname,quantity,storeid]).then(function(store){
        res.redirect('/lists')})
})

// this works
app.post('/home',function(req,res)
  {
    let storeName = req.body.title
    db.none('INSERT INTO stores(storeName) VALUES($1)',[storeName]).then(function(){
        res.redirect('/home')})

    
  })




app.listen(3000, () => console.log('Example app listening on port 3000!'))