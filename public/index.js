var chatbox = document.getElementsByClassName("chatbox")[0];
var inp = document.forms["Myform"]["mes"];

function messege()
{
    chatbox.innerHTML += '<div class="texts" style="margin:5px 10px 5px auto; background-color: coral; border-radius: 50px 50px 0px 50px;"><p style="color:white">Aditya</p><p style="color:black">'+ inp.value + '</p></div>';
    inp.value = "";
}

// window.onload = function()
// {
//     window.scrollBy("0","100000000000px");
// }