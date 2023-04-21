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
const frnds = cheerio.load(fs.readFileSync(__dirname + "/front.html"));
const hostname = 'localhost';
const port = 3000;

var inp_name,inp_email,inp_pass,ch2;
var passcheck = new Pvalidate();
passcheck.is().min(8).is().max(100).has().not().spaces();

app.use(BP.urlencoded({extended:true}));
app.use(exp.static(path.join(__dirname + "/public")));

mongoose.connect("mongodb+srv://AdityaBatgeri:Kiq2w2Ak7CR9bYgb@cluster0.d42f6ow.mongodb.net/Messenger?retryWrites=true&w=majority", {useNewUrlParser:true});

const struc1 = new mongoose.Schema({
    USERNAME:String,
    EMAIL:String,
    PASSWORD:String,
    FRIENDS:[String]
})

const struc2 = new mongoose.Schema({
    chatter1:String,
    chatter2:String,
    CHATS:[{chatter:String , mEsSeGe:String}]
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
            PASSWORD:inp_pass,
            FRIENDS:[]
        })
        upload.save();
        res.redirect("/front.html");
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
        // res.redirect("/index.html");
        res.redirect("/front.html");
    }
})

app.post("/" , function(req,res)
{
    const messege = req.body.mes;
    Record.updateOne({chatter1:inp_name , chatter2:ch2} , {$push:{CHATS:{chatter:inp_name , mEsSeGe:messege}}}).exec();
    Record.updateOne({chatter1:ch2 , chatter2:inp_name} , {$push:{CHATS:{chatter:inp_name , mEsSeGe:messege}}}).exec();
    $(".chatbox").append('<div class="texts" style="margin:5px 10px 5px auto; background-color: coral; border-radius: 50px 50px 0px 50px;"><p style="color:white">'+ inp_name +'</p><p style="color:black">'+ messege +'</p></div>');
    res.send($.html());
})

// app.get("/index.html" , async function(req,res)
// {
//     $(".chatbox").html('');
//     const cur = Record.find({chatter1:inp_name , chatter2:""}).cursor();
//     let obj2 = await cur.next();
//     for (let i=0 ; i<obj2.CHATS.length ; i++)
//     {
//         console.log(obj2.CHATS[i].chatter + ": " + obj2.CHATS[i].mEsSeGe);
//         if (obj2.CHATS[i].chatter == inp_name)
//         {
//             $(".chatbox").append('<div class="texts" style="margin:5px 10px 5px auto; background-color: coral; border-radius: 50px 50px 0px 50px;"><p style="color:white">'+ obj2.CHATS[i].chatter +'</p><p style="color:black">'+ obj2.CHATS[i].mEsSeGe +'</p></div>');
//         }
//         else 
//         {
//             $(".chatbox").append('<div class="texts"><p>'+ obj2.CHATS[i].chatter +'</p><p>'+ obj2.CHATS[i].mEsSeGe +'</p></div>');
//         }
//     }

//     res.send($.html());
// })

app.get("/front.html" , async function(req,res)
{
    frnds("body").html('<p class="topbar">Your Chats</p><a href="/find.html" class="add"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM224 160c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v48h48c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H288v48c0 8.8-7.2 16-16 16H240c-8.8 0-16-7.2-16-16V272H176c-8.8 0-16-7.2-16-16V224c0-8.8 7.2-16 16-16h48V160z"/></svg></a><div class="blanck"></div>');
    const newcur = await Profile.findOne({USERNAME:inp_name}).cursor().next();
    for (let i=0;i<newcur.FRIENDS.length;i++)
    {
        frnds("body").append('<form action="/new/" method="post"><button type="submit" class="list" name="chatterTwo" value="'+ newcur.FRIENDS[i] +'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg><p>'+ newcur.FRIENDS[i] +'</p></button></form>')
    }
    res.send(frnds.html());
})

app.get("/find.html" , function(req,res)
{
    res.sendFile(__dirname + "/find.html");
})

app.post("/find.html/" , async function(req,res)
{
    let flag1 = 0;
    const cur1 = Profile.find().cursor();
    for (let obj3 = await cur1.next() ; obj3 != null ; obj3 = await cur1.next())
    {
        if (obj3.USERNAME == req.body.searchuser)
        {
            flag1++;
        }
    }

    if (flag1 != 0)
    {
        Profile.updateOne({USERNAME:inp_name} , {$push:{FRIENDS:req.body.searchuser}}).exec();
        Profile.updateOne({USERNAME:req.body.searchuser} , {$push:{FRIENDS:inp_name}}).exec();
        const upload1 = new Record({
            chatter1:inp_name,
            chatter2:req.body.searchuser,
            CHATS:[]
        })
        const upload2 = new Record({
            chatter1:req.body.searchuser,
            chatter2:inp_name,
            CHATS:[]
        })
        upload1.save();
        upload2.save();
        res.redirect("/temp");
    }
    else 
    {
        res.send("The Username you are trying to find does not exists. Please search again");
    }
})

app.get("/temp" , function(req,res)
{
    res.redirect("/front.html");
})

app.post("/new/" , async function(req,res)
{
    $(".chatbox").html('');

    ch2 = req.body.chatterTwo;
    const cur2 = Record.find({chatter1:inp_name , chatter2:req.body.chatterTwo}).cursor();
    let obj4 = await cur2.next();
    for (let i=0 ; i<obj4.CHATS.length ; i++)
    {
        if (obj4.CHATS[i].chatter == inp_name)
        {
            $(".chatbox").append('<div class="texts" style="margin:5px 10px 5px auto; background-color: coral; border-radius: 50px 50px 0px 50px;"><p style="color:white">'+ obj4.CHATS[i].chatter +'</p><p style="color:black">'+ obj4.CHATS[i].mEsSeGe +'</p></div>');
        }
        else 
        {
            $(".chatbox").append('<div class="texts"><p>'+ obj4.CHATS[i].chatter +'</p><p>'+ obj4.CHATS[i].mEsSeGe +'</p></div>');
        }
    }

    res.send($.html());
})

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });