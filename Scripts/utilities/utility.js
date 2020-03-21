function getDateTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth()+1) < 10 ? '0' + (today.getMonth()+1) : (today.getMonth()+1) + '-' + today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
    var time = getTime();
    var dateTime = date + ' ' + time;
    return dateTime;
}

function sendMessagebySignalR(msg)
{
    var ClientId = clientId.value;
    var myChatHub = $.connection.realTimeHub;
    myChatHub.server.send(ClientId + delimeter + Doc_ID, msg);
}

function getTime()
{
    var today = new Date();
    var time =
        (today.getHours() < 10 ? '0' + today.getHours() : today.getHours())
        + ":"
        + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())
        + ':'
        + (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds());
    return time;
}

function getSimpleTime() {
    var today = new Date();
    var dateTime = (today.getHours() < 10 ? '0' + today.getHours() : today.getHours()) + '-' + (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()) + '-' + (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds());
    return dateTime;
}