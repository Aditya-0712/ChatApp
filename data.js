const exp = require("express");
const app = exp();
const BP = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const Evalidate = require("email-validator");
const Pvalidate = require("password-validator");
const fs = require("fs");
const cheerio = require("cheerio");
const sgnp = cheerio.load(fs.readFileSync(__dirname + "/Signup.html"));
const lgin = cheerio.load(fs.readFileSync(__dirname + "/Login.html"));
const $ = cheerio.load(fs.readFileSync(__dirname + "/index.html"));
const hostname = 'localhost';
const port = 3000;

var inp_name,inp_email,inp_pass;
var passcheck = new Pvalidate();
passcheck.is().min(8).is().max(100).has().not().spaces();

app.use(BP.urlencoded({extended:true}));
app.use(exp.static(path.join(__dirname + "/public")));

mongoose.connect("mongodb+srv://AdityaBatgeri:Kiq2w2Ak7CR9bYgb@cluster0.d42f6ow.mongodb.net/Messenger?retryWrites=true&w=majority", {useNewUrlParser:true});

const struc1 = new mongoose.Schema({
    USERNAME:String,
    EMAIL:String,
    PASSWORD:String
})

const struc2 = new mongoose.Schema({
    chatter:String,    
    CHATS:String
})

const Profile = mongoose.model("profiles" , struc1);
const Record = mongoose.model("texts" , struc2);

app.get("/" , function(req,res)
{
    res.sendFile(__dirname + "/Login.html");
})

app.get("/Login.html" , function(req,res)
{
    res.sendFile(__dirname + "/Login.html");
})

app.get("/Signup.html" , function(req,res)
{
    res.sendFile(__dirname + "/Signup.html");
})

app.post("/Signup.html/" , function(req,res)
{
    inp_name = req.body.username;
    inp_email = req.body.email;
    inp_pass = req.body.password;

    var checkE = Evalidate.validate(inp_email);
    var checkP = passcheck.validate(inp_pass);

    if (checkE == true && checkP == true)
    {
        const upload = new Profile({
            USERNAME:inp_name,
            EMAIL:inp_email,
            PASSWORD:inp_pass
        })
        upload.save();
        res.redirect("/index.html");
    }
    else if (checkE == false)
    {
        sgnp("p.warnpass").css("display" , "none");
        sgnp("p.warnemail").css("display" , "flex");
        res.send(sgnp.html());
    }
    else if (checkP == false)
    {
        sgnp("p.warnemail").css("display" , "none");
        sgnp("p.warnpass").css("display" , "flex");
        res.send(sgnp.html());
    }
})

app.post ("/Login.html/" , async function(req,res){
    inp_pass = req.body.password;
    var flag = 0;
    const cursor = Profile.find().cursor();
    for (let obj1 = await cursor.next() ; obj1 != null ; obj1 = await cursor.next())
    {
        if (obj1.USERNAME == req.body.username && obj1.PASSWORD == inp_pass)
        {
            inp_name = obj1.USERNAME;
            inp_email = obj1.EMAIL;
            flag++;
        }
        else if (obj1.EMAIL == req.body.username && obj1.PASSWORD == inp_pass)
        {
            inp_name = obj1.USERNAME;
            inp_email = obj1.EMAIL;
            flag++;
        }
    }

    if (flag == 0)
    {
        lgin("p.warnpass").css("display" , "flex");
        res.send(lgin.html());
    }
    else 
    {
        res.redirect("/index.html");
    }
})

app.post("/" ,function(req,res)
{
    const messege = req.body.mes;
    const cu = new Record({
        chatter:inp_name,
        CHATS:messege
    })
    cu.save();
    $(".chatbox").append('<div class="texts" style="margin:5px 10px 5px auto; background-color: coral; border-radius: 50px 50px 0px 50px;"><p style="color:white">'+ inp_name +'</p><p style="color:black">'+ messege +'</p></div>');
    res.send($.html());
})

app.get("/index.html" , async function(req,res)
{
    $(".chatbox").html('<div class="texts"><p style="color:red">Admin</p><p>Welcome!!</p></div><div class="texts"><p style="color:red">Admin</p><p>Happy Chatting...</p></div>');
    const cur = Record.find().cursor();
    let obj2 = await cur.next();
    for (obj2 ; obj2 != null ; obj2 = await cur.next())
    {
        if (obj2.chatter == inp_name)
        {
            $(".chatbox").append('<div class="texts" style="margin:5px 10px 5px auto; background-color: coral; border-radius: 50px 50px 0px 50px;"><p style="color:white">'+ obj2.chatter +'</p><p style="color:black">'+ obj2.CHATS +'</p></div>');
        }
        else 
        {
            $(".chatbox").append('<div class="texts"><p>'+ obj2.chatter +'</p><p>'+ obj2.CHATS +'</p></div>');
        }
    }
    res.send($.html());
})

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });