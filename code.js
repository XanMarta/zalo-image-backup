var delay = 60;
var subdomain = "lunar-dream-13";
var secret = "supersecret";

var endpoint = `https://${subdomain}.loca.lt`;
element = document.getElementById("messageViewScroll");
itv = setInterval(() => {
    console.log("Backing up data ...")
    let urls = [];
    Array.from(element.getElementsByClassName("ci-th__thumb")).forEach(e => {
        urls.push(e.getAttribute("data-drag-src"));
    });
    let xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("Bypass-Tunnel-Reminder", "yes");
    xhr.send(JSON.stringify({secret: secret, data: urls}));
}, delay * 1000);
