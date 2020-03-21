
var myChatHub = $.connection.realTimeHub;

$(function () {
    myChatHub.client.appendNewMessage = function (name, message) {
        receiveMessage(name, message);
    };
    $.connection.hub.url = "http://185.37.53.121/liketeamviewer/signalr";
    jQuery.support.cors = false;
    $.connection.hub.logging = true;
    $.connection.hub.error(function(error) {
        writeLog('Connection hub: ' + error, 'danger');
    });

    $.connection.hub.start({ jsonp: true }).done(function () {
        RegisterThisMachineOnTheServer();
    }).fail(function (error) {
        console.error(error);
        writeLog(error, 'danger');
        setTimeout(function () {
            writeLog('Do not worry, it is going to reconnect again after 5 seconds.', 'info');
            $.connection.hub.start();
        }, 3000);
    });

    $.connection.hub.disconnected(function () {
        if ($.connection.hub.lastError) {
            // alert("disconnected reason:" + $.connection.hub.lastError.message);
            writeLog("disconnected reason:" + $.connection.hub.lastError.message, 'danger');
            writeLog('Do not worry, it is going to reconnect again after 5 seconds.', 'info');
        }
        setTimeout(function () {
            $.connection.hub.start();
        }, 3000);
    });

});

function receiveMessage(name, message)
{
    if(message.includes(DisconnectTag))
    {
        var clientId = document.getElementById('myPeerId').value;
        var mySessionId = name.split(delimeter)[0];
        if(clientId === mySessionId)
        {
            closeMasterStreamin();
        }
    }
    if(message.includes(RejectTag))
    {
        closeMasterStreamin();
        closeStreaming();
        document.getElementById('btnCloseConnectionModal').click();
    }
    if(message.includes(PosFeedback))
    {
        toggleChatBar(message);
        document.getElementById('h3Message').innerText = "Start to Chat";
    }
    CheckReceivedMsg(name, message);
}

function CheckReceivedMsg(name, message)
{
    var db = new PouchDB(ClientConfigurationDbName);
    db.get(UserConfigTableName).then(function (doc)
    {
        if(name === doc.ID)
        {
            toggleChatBar(message);
            setReceivedMessageIntoChatArea(message);
        }
    }).catch(function (err)
    {
        // alert('There might be problem in your system. Please reopen the Application again.');
        writeLog('There might be problem in your system. Please reopen the Application again.', 'warning');
    });
}

function toggleChatBar(message)
{
    var chatBarStyle = document.getElementById('m_header_topbar').style.display;
    if(message === PosFeedback)
    {
        if(chatBarStyle === 'none')
        {
            document.getElementById('m_header_topbar').style.display = 'grid';
        }
        document.getElementById('btnCloseConnectionModal').click();
    }
    else if(message === DisconnectTag)
    {
        document.getElementById('m_header_topbar').style.display = 'none';
    }
}

function ForceScrollDown()
{
    $('#divChatArea').animate({
        scrollTop: $('#divChatArea')[0].scrollHeight}, 2000);
}

function setSentMessageIntoChatArea(e)
{
    if(e.keyCode === 13)
    {
        var txtChat = document.getElementById('txtChat').value;
        var divChatArea = document.getElementById('divChatArea').innerHTML + makeMyMessageStyle(txtChat);
        document.getElementById('divChatArea').innerHTML = divChatArea;
        document.getElementById('txtChat').value = '';
        var ClientId = document.getElementById('recipient-name').value;
        myChatHub.server.send(ClientId, txtChat);
        ForceScrollDown();
    }
    else
    {

    }
}

function setReceivedMessageIntoChatArea(message)
{
    if(isIllegalCharacter(message) === false)
    {
        var divChatArea = document.getElementById('divChatArea').innerHTML + makeHisMessageStyle(message);
        document.getElementById('divChatArea').innerHTML = divChatArea;
        ForceScrollDown();
        showNotification(message);
        plasyNotification();
    }
}

function makeMyMessageStyle(message)
{
    var messageWithStyle = '<div class="m-messenger__wrapper">\n' +
        '\t\t\t\t\t\t\t<div class="m-messenger__message m-messenger__message--out">\n' +
        '\t\t\t\t\t\t\t\t<div class="m-messenger__message-body">\n' +
        '\t\t\t\t\t\t\t\t\t<div class="m-messenger__message-arrow"></div>\n' +
        '\t\t\t\t\t\t\t\t\t<div class="m-messenger__message-content">\n' +
        '\t\t\t\t\t\t\t\t\t\t<div class="m-messenger__message-text">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t' + message + '\n' +
        '\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t</div>';

    return messageWithStyle;
}

function makeHisMessageStyle(message)
{
    var messageWithStyle = '<div class="m-messenger__wrapper">\n' +
        '\t\t\t\t\t\t\t<div class="m-messenger__message m-messenger__message--in">\n' +
        '\t\t\t\t\t\t\t\t<div class="m-messenger__message-no-pic m--bg-fill-danger">\n' +
        '\t\t\t\t\t\t\t\t\t<span>M</span>\n' +
        '\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t<div class="m-messenger__message-body">\n' +
        '\t\t\t\t\t\t\t\t\t<div class="m-messenger__message-arrow"></div>\n' +
        '\t\t\t\t\t\t\t\t\t<div class="m-messenger__message-content">\n' +
        '\t\t\t\t\t\t\t\t\t\t<div class="m-messenger__message-username">\n' +
        '\t\t\t\t\t\t\t\t\t\t\tClient\n' +
        '\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t\t<div class="m-messenger__message-text">\n' +
        '\t\t\t\t\t\t\t\t\t\t\t' + message + '.\n' +
        '\t\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t\t</div>\n' +
        '\t\t\t\t\t\t</div>';

    return messageWithStyle;
}