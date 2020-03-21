var clientId = document.getElementById('recipient-name');

var SessionId1 = document.getElementById( 'SessionId1');
var SessionId2 = document.getElementById( 'SessionId2');
var SessionId3 = document.getElementById( 'SessionId3');

var Widget1 = document.getElementById( 'Widget1');
var Widget2 = document.getElementById( 'Widget2');
var Widget3 = document.getElementById( 'Widget3');

var LastConnection1 = document.getElementById( 'LastConnection1');
var LastConnection2 = document.getElementById( 'LastConnection2');
var LastConnection3 = document.getElementById( 'LastConnection3');

var SessionImage1 = document.getElementById( 'SessionImage1');
var SessionImage2 = document.getElementById( 'SessionImage2');
var SessionImage3 = document.getElementById( 'SessionImage3');

function showMasterEye(show)
{
    if(show)
    {
        showToast('Master is watching you.', 'info');
        document.getElementById('MasterEye').style.display = 'inline';
    }
    else
    {
        showToast('Master said Bye for now.', 'info');
        document.getElementById('MasterEye').style.display = 'none';
    }
}

function showPanel(show)
{
    loadPanel();
    var video = document.getElementById('videoSource');
    var mainPanel = document.getElementById('mainPanel');

    if(show === true)
    {
        initialMainPanel();
        video.style.display = 'none';
        mainPanel.style.display = 'block';
    }
    else
    {
        video.style.display = 'block';
        mainPanel.style.display = 'none';
    }
    showChatBar(!show);
}

function showChatBar(show)
{
    var chatBarStyle = document.getElementById('m_header_topbar').style.display;
    if(show === true)
    {
        if(chatBarStyle === 'none')
        {
            document.getElementById('m_header_topbar').style.display = 'grid';
        }
        document.getElementById('btnCloseConnectionModal').click();
    }
    else if(show === false)
    {
        document.getElementById('m_header_topbar').style.display = 'none';
    }
    if(!clientId.value.includes(' '))
    {
        document.getElementById('m_id_1').style.display = 'none';
        document.getElementById('m_id_2').style.display = 'none';
        document.getElementById('m_id_3').style.display = 'none';
        document.getElementById('m_id_4').style.display = 'none';
        document.getElementById('m_quick_sidebar_toggle').style.display = 'none';
    }
	else
	{
		document.getElementById('m_id_1').style.display = 'inline-block';
        document.getElementById('m_id_2').style.display = 'inline-block';
        document.getElementById('m_id_3').style.display = 'inline-block';
        document.getElementById('m_id_4').style.display = 'inline-block';
        document.getElementById('m_quick_sidebar_toggle').style.display = 'inline-block';
	}
}

function onChatButtonClick()
{
    f_send_keyboard = false;
}

function onCloseChatButtonClick()
{
    f_send_keyboard = true;
}

function closeChatArea()
{
    document.getElementById('m_quick_sidebar_close').click();
}

function showConnectionButtons(show)
{
    if(show === true)
    {
        document.getElementById('divNewSessionButton').style.display = 'block';
        document.getElementById('HistoryConnectionButton1').style.display = 'block';
        document.getElementById('HistoryConnectionButton2').style.display = 'block';
        document.getElementById('HistoryConnectionButton3').style.display = 'block';
        document.getElementById('GetNewSessionId').style.display = 'block';
    }
    else
    {
        document.getElementById('divNewSessionButton').style.display = 'none';
        document.getElementById('HistoryConnectionButton1').style.display = 'none';
        document.getElementById('HistoryConnectionButton2').style.display = 'none';
        document.getElementById('HistoryConnectionButton3').style.display = 'none';
        document.getElementById('GetNewSessionId').style.display = 'none';
    }
}

function onMouseKeyboardClick()
{
    var btn = document.getElementById("m_quick_sidebar_keyboard");
    var info = 'btn-metal';
    var danger = 'btn-warning';

    if (btn.classList.contains(info))
    {
        btn.classList.remove(info);
        btn.classList.add(danger);
        mouse_keyboard_enable = true;
    }
    else
    {
        btn.classList.remove(danger);
        btn.classList.add(info);
        mouse_keyboard_enable = false;
    }
}

function onShareScreenClick()
{
    var btn = document.getElementById("m_quick_sidebar_laptop");
    var info = 'btn-metal';
    var danger = 'btn-warning';

    if (btn.classList.contains(info))
    {
        btn.classList.remove(info);
        btn.classList.add(danger);
        screen_sharing_enable = true;
        sendMessagebySignalR(screen_sharing_active_Tag);
    }
    else
    {
        btn.classList.remove(danger);
        btn.classList.add(info);
        screen_sharing_enable = false;
        sendMessagebySignalR(screen_sharing_deactive_Tag);
    }
}

function initialMainPanel()
{
    var info = 'btn-metal';
    var danger = 'btn-warning';
    var btnShareScreen = document.getElementById("m_quick_sidebar_laptop");
    var btnShareKeyboard = document.getElementById("m_quick_sidebar_keyboard");

    btnShareScreen.classList.remove(danger);
    btnShareScreen.classList.add(info);
    btnShareKeyboard.classList.remove(danger);
    btnShareKeyboard.classList.add(info);
    mouse_keyboard_enable = false;
    screen_sharing_enable = false;
}

function ForceLogAreaScrollDown()
{
    $('#logArea').animate({
        scrollTop: $('#logArea')[0].scrollHeight}, 2000);
}

function writeLog(msg, logType)
{
    if(logType === 'error')
    {
        logType = 'danger';
    }
    var logElement = document.getElementById('logArea');
    var logBody = '<div class="m-timeline-2__item">\n' +
        '<span class="m-timeline-2__item-time" style="font-size: 13px">' + getTime() + '</span>\n' +
            '<div class="m-timeline-2__item-cricle">\n' +
                '<i class="fa fa-genderless m--font-' + logType + '"></i>\n' +
            '</div>\n' +
            '<div class="m-timeline-2__item-text">\n' +
                msg +
            '</div>\n' +
        '</div>';
    logElement.innerHTML += logBody;
    ForceLogAreaScrollDown();
}

function loadPanel()
{
    loadLast3Sessions().then(value => {
        if(value.total_rows > 0)
        {
            if(value.rows[0].doc.SessionID !== undefined)
            {
                document.getElementById('NoSession').style.display = 'none';

                var sessionId = value.rows[0].doc.SessionID;
                Widget1.style.display = 'inline';
                SessionId1.innerText = sessionId;
                LastConnection1.innerText = value.rows[0].doc.LastConnectionDate;
                readThumbnail(sessionId).then(value => SessionImage1.src = value);
            }
            if(value.rows[1] !== undefined)
            {
                if(value.rows[1].doc.SessionID !== undefined)
                {
                    var sessionId = value.rows[1].doc.SessionID;
                    Widget2.style.display = 'inline';
                    SessionId2.innerText = sessionId;
                    LastConnection2.innerText = value.rows[1].doc.LastConnectionDate;
                    readThumbnail(sessionId).then(value => SessionImage2.src = value);
                }
            }
            if(value.rows[2] !== undefined)
            {
                if(value.rows[2].doc.SessionID !== undefined)
                {
                    var sessionId = value.rows[2].doc.SessionID;
                    Widget3.style.display = 'inline';
                    SessionId3.innerText = sessionId;
                    LastConnection3.innerText = value.rows[2].doc.LastConnectionDate;
                    readThumbnail(sessionId).then(value => SessionImage3.src = value);
                }
            }
        }
    }).catch(error => {
        console.log(error);
    });
}

loadLicenseStatus();
function loadLicenseStatus()
{
    let exp_data = document.getElementById('versionStatus');
    exp_data.innerText = 'Expiration Date: --/--/----';
    getUserEmail().then(email => {
        $.support.cors = true;
        var myUrl = 'http://185.37.53.121/liketeamviewer/LicenseManagment/getLicense';
        var proxy = 'https://cors-anywhere.herokuapp.com/';

        var jsonData = {};
        jsonData['email'] = email;
        console.log('email: ' + email);
        $.post(proxy + myUrl, { Email: jsonData['email'] })
        .done(function(response)
        {
            if(response === '104')
            {
                writeLog('User does not have agreement.', 'warning');
                exp_data.innerText = 'User does not have agreement.'
            }
            else
            {
                writeLog('License status: ' + response, 'info');
                exp_data.innerText = response;
            }
        }).fail(function(x, y)
        {
            writeLog('There is an issue in internet connection.', 'error');
        });
    });
}
