const {desktopCapturer} = require('electron');
var peer = null;
let desktopSharing = false;
let master_desktopSharing = false;
let localStream;
let master_localStream;
var lastPeerId = null;
var conn = null;

var video = document.getElementById('videoSource');
var mainPanel = document.getElementById('mainPanel');
var clientId = document.getElementById('recipient-name');
var clientScreenWidth = 0;
var clientScreenHeight = 0;

var Doc_ID = 0;
let MasterSessionId = 0;
let MasterCall = null;

connectoToServer();
async function connectoToServer()
{
    let promise = new Promise((resolve, reject) => {
        try {
            showToast('Wait for connecting...', 'info');
            writeLog('Wait for connecting...', 'info');
            peer = new Peer('', {host: '185.37.53.121', port: 9001, path: '/streaming'});
            peer.on('open', function(){
                if (peer.id === null) {
                    console.log('Received null id from peer open');
                    writeLog('Received null id from peer open', 'danger');
                    peer.id = lastPeerId;
                } else {
                    lastPeerId = peer.id;
                }

                // writeLog('ID: ' + peer.id, 'info');
                MasterSessionId = peer.id;
                document.getElementById('myPeerId').value = peer.id;
                writeLog('Software is ready to use.', 'info');
                showToast('Software is ready to use.', 'info');
                closeBlockUI('helloBody');
                showConnectionButtons(true);
                resolve('open');
            });

            peer.on('connection', function(connLocal) {                                                                                  // for detecting connection which is sent by client.
                connLocal.on('data', function(data){                                                                                     // so the client can send message to the host.
                    if(data.file !== undefined)
                    {
                        try {
                            handleSaveReceivedFile(data, function(err, succ)
                            {
                                conn.send({
                                    blockUI: 'CLOSE'
                                });
                            });
                        }
                        catch (e) {
                            conn.send({
                                blockUI: 'CLOSE'
                            });
                        }
                    }
                    else if(data.blockUI !== undefined)
                    {
                        closeBlockUI('helloBody');
                    }
                    else
                    {
                        var screen_size = data.replace(Screen_Tag_Size, '').replace(' ', '').split(',');
                        clientScreenWidth = screen_size[0];
                        clientScreenHeight = screen_size[1];
                        if(clientScreenHeight !== undefined)
                        {
                            writeLog('The destination monitor dimension has been received: ' + screen_size[0] + '-' + screen_size[1], 'info');
                        }
                    }
                });
            });

            peer.on('call', function(call){
                writeLog('Someone is calling...', 'info');
                MasterCall = call;
                confirmationWindow();
            });

            peer.on('disconnected', function () {
                console.log('Connection lost. Please reconnect');
                writeLog('Connection lost. Please reconnect', 'warning');
                closeStreaming();
                showToast('Wait for reconnecting...', 'info');
                forceServerForbeingRestart();
            });

            peer.on('error', function (err) {
                showPanel(true);
                showToast(err, 'error');
                closeStreaming();
                console.log(err);
                writeLog(err, 'danger');
            });
        }
        catch (err) {
            //alert('Error: ' + err);
            closeStreaming();
            writeLog(err, 'danger');
            forceServerForbeingRestart();
        }
    });
    let result = await promise;
    return result;
}

function onGetNewSession()
{
    document.getElementById('newSessionID').value = MasterSessionId;
	
	var btn = document.getElementById("m_quick_sidebar_master_session_id");
    var info = 'btn-info';
    var danger = 'btn-warning';

    btn.classList.remove(info);
    btn.classList.add(danger);
    setTimeout(function () {
        btn.classList.remove(danger);
        btn.classList.add(info);
    }, 300);
	
    document.getElementById('btnOpenModalNewSessionId').click();
}

function confirmationWindow()
{
    document.getElementById('btnOpenModalConfirmation').click();
}

function onAcceptButton()
{
    masterReceiveCallHandler(MasterCall);
    document.getElementById('dismissConfirmation').click();
}

function onRejectButton()
{
    document.getElementById('dismissConfirmation').click();
    sendMessagebySignalR(RejectTag);
    closeMasterStreamin();
}

function forceServerForbeingRestart()
{
    CallApi('http://185.37.53.121/node/streamingjs/index.js', '', 'GET', function (response) {
        console.log('Called again');
        writeLog('Calling again...', 'info');
        connectoToServer();
    });
}

function RegisterThisMachineOnTheServer()
{
    var db = new PouchDB(ClientConfigurationDbName);
    db.get(UserConfigTableName).then(function (doc)
    {
        // showConnectionButtons(true);
    }).catch(function (err)
    {
        var rnd1 = Math.floor(Math.random()*(999-100+1)+100);
        var rnd2 = Math.floor(Math.random()*(999-100+1)+100);
        CheckIDAndRegisterIt(rnd1 + '-' + rnd2);
    });
}

function CheckIDAndRegisterIt(ClientID)
{
    CallJSONP("http://185.37.53.121/liketeamviewer/Registration/CheckID", { ID: ClientID }, function (response) {
        switch (response.ReturnValue) {
            case '200':
                SaveInDb(ClientID);
                break;

            case '500':
                document.getElementById('registeredID').innerText = 'There is a problem. Reopen the Application(0xE1d0089)';
                break;

            case '104':
                document.getElementById('registeredID').innerText = 'There is a problem. Reopen the Application(0xECA1200)';
                break;
        }
    },function(XMLHttpRequest, textStatus, errorThrown) {
        document.getElementById('registeredID').innerText = 'There is a problem. Check again later.';
    });
}

function SaveInDb(ClientID)
{
    var db = new PouchDB(ClientConfigurationDbName);
    db.put({
        _id: UserConfigTableName,
        ID: ClientID
    }).then(function (response) {
        // showConnectionButtons(true);
    }).catch(function (err) {
        alert('There is a problem. Reopen the Application(0xE2s9901)');
        console.log(err.message);
        writeLog(err.message, 'danger');
    });
}

function onNewSessionClick()
{
    document.getElementById('btnOpenModalConnection').click();
}

function onConnectToClient(index)
{
    showBlockUI('helloBody');
    checkLicense(function(license)
    {
        if(license === null)
        {
            closeBlockUI('helloBody');
            showToast('Your license has expired. Please contact wih supporter.', 'warning');
            writeLog('Your license has expired. Please contact wih supporter.', 'warning');
        }
        else
        {
            if(peer.disconnected)
            {
                connectoToServer().then(msg => {
                    fireConnection(index);
                });
            }
            else
            {
                fireConnection(index);
            }
        }
    });
}

function fireConnection(index)
{
    if(index === -1)
    {
        var db = new PouchDB(ClientConfigurationDbName);
        db.get(UserConfigTableName).then(function (doc)
        {
            var ClientId = clientId.value;
            var myChatHub = $.connection.realTimeHub;
            Doc_ID = doc.ID;
            myChatHub.server.send(ClientId + delimeter + doc.ID, ConnectTag);
            openStreaming();
        }).catch(function (err)
        {
            showToast('Connection is impossible.', 'warning');
            writeLog('Connection is impossible.', 'warning');
            closeBlockUI('helloBody');
        });
    }
    else
    {
        getSessionIdByIndex(index).then(sessionId => {
            if(sessionId !== 0)
            {
                var db = new PouchDB(ClientConfigurationDbName);
                db.get(UserConfigTableName).then(function (doc)
                {
                    clientId.value = sessionId;
                    var ClientId = clientId.value;
                    var myChatHub = $.connection.realTimeHub;
                    Doc_ID = doc.ID;
                    myChatHub.server.send(ClientId + delimeter + doc.ID, ConnectTag);
                    openStreaming();
                }).catch(function (err)
                {
                    showToast('Connection is impossible: ' + err, 'warning');
                    writeLog('Connection is impossible: ' + err, 'warning');
                });
            }
            else
            {
                showToast('Connection is impossible: ' + 'The ssession Id is not valid.', 'warning');
                writeLog('Connection is impossible: ' + 'The ssession Id is not valid.', 'warning');
            }
        });
    }
}

function masterReceiveCallHandler(call)
{
    var f_found = false;
    var id;
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        id = sources[0].id;
        for (const source of sources)
        {
            if(source.name === 'Entire Screen')
            {
                onMasterAccessApproved(source.id, call);
                f_found = true;
                break;
            }
        }
        if(!f_found)
        {
            onMasterAccessApproved(id, call);
        }
    })
}

function onMasterAccessApproved(desktop_id, call) {
    call.on('stream', function(remoteStream) {
        console.log('I received video streaming.');
        // document.getElementById('videoSource').src = URL.createObjectURL(remoteStream);
        // document.getElementById('videoSource').srcObject = remoteStream;
    });

    master_desktopSharing = true;
    console.log("Desktop sharing started.. desktop_id:" + desktop_id);
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                maxWidth: 1280,
                maxHeight: 960
            }
        },
        cursor: 'none'
    }, gotStreamMaster, getUserMediaErrorMaster);

    function gotStreamMaster(stream) {
        master_localStream = stream;
        console.log('I answer.');
        writeLog('I have answered!', 'info');
        showMasterEye(true);
        call.answer(stream);
        // showPanel(false);
        stream.onended = function() {
            if (master_desktopSharing) {
                master_desktopSharing = false;
                if (master_localStream)
                {
                    master_localStream.getTracks()[0].stop();
                }
                master_localStream = null;
            }
        };
    }

    function getUserMediaErrorMaster(e) {
        console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
    }
}

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        writeLog('Desktop Capture access rejected.', 'danger');
        closeBlockUI('helloBody');
        return;
    }
    desktopSharing = true;

    console.log("Desktop sharing started... desktop_id:" + desktop_id);
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                maxWidth: 1280,
                maxHeight: 960
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        localStream = stream;
        streaming(stream);

        stream.onended = function() {
            closeStreaming();
        };
    }

    function getUserMediaError(e) {
        console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
        writeLog('getUserMediaError: ' + JSON.stringify(e, null, '---'), 'warning');
    }
}

function streaming(remoteStream)
{
    if (conn) {
        conn.close();
    }
    conn = peer.connect(clientId.value, {
        reliable: true
    });

    if(conn !== undefined)
    {
        conn.on('open', function () {
            console.log("Connected to: " + conn.peer);
            writeLog("Connected to: " + conn.peer, 'info');
            conn.send('Hello man');

            var call = peer.call(clientId.value, remoteStream);
            console.log('Calling....');
            writeLog('Calling....', 'info');
            call.on('stream', function(clientStream) {
                showPanel(false);
                closeBlockUI('helloBody');
                showToast('You are connected to the ' + conn.peer + '.', 'success');
                console.log('Client answered');
                writeLog('Client answered', 'info');

                // document.getElementById('videoSource').src = URL.createObjectURL(clientStream);
                document.getElementById('videoSource').srcObject = clientStream;

                setUserSessionHistoryTbl(conn.peer);
                setTimeout(function () {
                    if(conn != undefined)
                    {
                        saveThumbnail(conn.peer);
                    }
                }, 10000);
            });
        });
    }

    if(conn !== undefined)
    {
        conn.on('close', function () {
            console.log("Connection closed");
            showPanel(true);
            showToast('The connection was lost.', 'warning');
            writeLog('The connection was lost.', 'warning');
            closeStreaming();
        });
    }
}

function closeStreaming()
{
    closeBlockUI('helloBody');
    closeChatArea();
    if (localStream)
    {
        localStream.getTracks()[0].stop();
    }
    localStream = null;
}

function closeMasterStreamin()
{
    closeBlockUI('helloBody');
    if (master_desktopSharing) {
        master_desktopSharing = false;
        if (master_localStream)
        {
            master_localStream.getTracks()[0].stop();
        }
        master_localStream = null;
    }
    writeLog('The master disconnected from your system.', 'info');
    showMasterEye(false);
}

function openStreaming()
{
	var f_found = false;
	var screen_name = '';
	
    var id;// = 'screen:0:0';//($('select').val()).replace(/window|screen/g, function(match) { return match + ":"; });
	desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
		id = sources[0].id;
		for (const source of sources)
		{
			screen_name += source.name + '(-)';
			//alert(source.name);
			if(source.name === 'Entire Screen')
			{
				onAccessApproved(source.id);
				f_found = true;
				break;
			}
		}
		if(!f_found)
		{
			onAccessApproved(id);
			//showToast('It is not possible to detect screen.', 'warning');
			writeLog('Please send this message to supporter: ' + screen_name,  'warning');
			//onPowerOffClick();
		}
	})
}

function onFileTransferClick()
{
    var btn = document.getElementById("m_quick_sidebar_file_transfer");
    var info = 'btn-info';
    var danger = 'btn-warning';

    btn.classList.remove(info);
    btn.classList.add(danger);
    setTimeout(function () {
        btn.classList.remove(danger);
        btn.classList.add(info);
    }, 300);

    OpenDialogFileaAndSend(conn);
}

function onPowerOffClick()
{
    conn.send('Hello man123');
    closeChatArea();
    sendMessagebySignalR(DisconnectTag);
    closeStreaming();
    showPanel(true);
    // showConnectionButtons(true);
    peer.disconnect();
    conn.close();
    closeBlockUI('helloBody');
}

function onRefreshingClick()
{
    var btn = document.getElementById("m_quick_sidebar_refreshing");
    var info = 'btn-info';
    var danger = 'btn-warning';

    btn.classList.remove(info);
    btn.classList.add(danger);
    setTimeout(function () {
        btn.classList.remove(danger);
        btn.classList.add(info);
    }, 300);

    onPowerOffClick();                                                                                                  // Close connection and streaming
    setTimeout(function () {
        onConnectToClient(1);                                                                                    // Reconnecting by index = -1
    }, 7000);
}

