const { app, BrowserWindow, screen } = require('electron')

var videoPanel = document.getElementById('videoSource');
var videoPanelWidth = videoPanel.offsetWidth;
var videoPanelHeight = videoPanel.offsetHeight;

$(window).resize(function() {
    videoPanelWidth = videoPanel.offsetWidth;
    videoPanelHeight = videoPanel.offsetHeight;
    console.log('Width: ' + videoPanelWidth + ', Height: ' + videoPanelHeight);
});

$(videoPanel).mousemove(function(event){
    // console.log(event.pageX + ", " + event.pageY);
    sendMouseEvent(event, Mouse_Tag_Move);
});

$(videoPanel).mousedown(function(event){
    // console.log('>>> Left down Click: ' + event.pageX + ", " + event.pageY);
    sendMouseEvent(event, Mouse_Tag_LeftDown);
});

$(videoPanel).mouseup(function(event)
{
    // console.log('>>> Left up Click: ' + event.pageX + ", " + event.pageY);
    sendMouseEvent(event, Mouse_Tag_LeftUp);
});

videoPanel.addEventListener('wheel', (event) => {
    // console.log(event.deltaY);
    sendMouseWheel(event.deltaY);
});

window.addEventListener('contextmenu', (event) => {
    // event.preventDefault();
    // console.log('>>> Right Click: ' + event.pageX + ", " + event.pageY);
    sendMouseEvent(event, Mouse_Tag_RightClick);
}, false);

function sendMouseEvent(event, tag)
{
    if(conn != null)
    {
        videoPanelWidth = videoPanel.offsetWidth;
        videoPanelHeight = videoPanel.offsetHeight;

        var x = scale(event.pageX, 0, videoPanelWidth, 0, clientScreenWidth);
        var y = scale(event.pageY, 70, videoPanelHeight, 0, clientScreenHeight);
        if(mouse_keyboard_enable)
        {
            conn.send(tag + x + ", " + y);
        }
    }
}

function sendMouseWheel(deltaY)
{
    if(conn != null)
    {
        if(mouse_keyboard_enable)
        {
            conn.send(Mouse_Tag_Wheel + deltaY);
        }
    }
}

function scale (x, fromLow, fromHigh, toLow, toHigh) {
    return ((x - fromLow) * (toHigh - toLow) / (fromHigh - fromLow)) + toLow
}

function onCLickVideoSource()
{
    f_send_keyboard = true;
}

function onMouseOverVideoSource()
{
    // console.log('Mouse over video source');
}

function onMouseLeaveVideoSource()
{
    // console.log('Mouse leave video source');
}

function onMouseLeaveChatArea()
{
    console.log('Mouse leave chat area');
}

function onMouseOverChatArea()
{
    // console.log('Mouse over chat area');
}

/*var last_x_mouse = 0;
var last_y_mouse = 0;
setInterval(function(){
    if(screen.getCursorScreenPoint().x === last_x_mouse && screen.getCursorScreenPoint().y === last_y_mouse)
    {

    }
    else
    {
        console.log('>>>> ' + screen.getCursorScreenPoint().x + '-' + screen.getCursorScreenPoint().y);
        last_x_mouse = screen.getCursorScreenPoint().x;
        last_y_mouse = screen.getCursorScreenPoint().y;
        if(conn != null)
        {
            conn.send(Mouse_Tag + last_x_mouse + ", " + last_y_mouse);
        }
    }
}, 100);*/




