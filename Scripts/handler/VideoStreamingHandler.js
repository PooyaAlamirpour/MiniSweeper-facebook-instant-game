const {desktopCapturer} = require('electron');
const peer = new Peer('', {host: '185.37.53.121', port: 9001, path: '/streaming'});

let desktopSharing = false;
let localStream;
var lastPeerId = null;
var conn = null;

var video = document.getElementById('videoSource');
document.querySelector('button').addEventListener('click', function(e) {
    toggle();
});
$(document).ready(function() {
    showSources();
});

function addSource(source) {
    $('select').append($('<option>', {
        value: source.id.replace(":", ""),
        text: source.name
    }));
    $('select option[value="' + source.id.replace(":", "") + '"]').attr('data-img-src', source.thumbnail.toDataURL());
}

function showSources() {
    desktopCapturer.getSources({ types:['window', 'screen'] }, function(error, sources) {
        for (let source of sources) {
            console.log("Name: " + source.name);
            addSource(source);
        }
    });
}

function toggle() {
    if (!desktopSharing) {
        var id = 'screen:0:0';//($('select').val()).replace(/window|screen/g, function(match) { return match + ":"; });
        onAccessApproved(id);
    } else {
        desktopSharing = false;

        if (localStream)
        {
            localStream.getTracks()[0].stop();
        }
        localStream = null;

        document.querySelector('button').innerHTML = "Enable Capture";

        $('select').empty();
        showSources();
    }
}

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    desktopSharing = true;

    document.querySelector('button').innerHTML = "Disable Capture";
    console.log("Desktop sharing started.. desktop_id:" + desktop_id);
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        localStream = stream;
        //document.getElementById('videoSource').src = URL.createObjectURL(stream);
        streaming(stream);

        stream.onended = function() {
            if (desktopSharing) {
                toggle();
            }
        };
    }

    function getUserMediaError(e) {
        console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
    }
}

function streaming(remoteStream)
{
    if (conn) {
        conn.close();
    }
    conn = peer.connect(document.getElementById("receiver-id").value, {
        reliable: true
    });

    conn.on('open', function () {
        console.log("Connected to: " + conn.peer);

        var call = peer.call(document.getElementById("receiver-id").value, remoteStream);
        call.on('stream', function(remoteStream) {
            document.getElementById('videoSource').src = URL.createObjectURL(remoteStream);
        });
    });

    conn.on('close', function () {
        console.log("Connection closed ******");
    });
}

peer.on('open', function(){
    if (peer.id === null) {
        console.log('Received null id from peer open');
        peer.id = lastPeerId;
    } else {
        lastPeerId = peer.id;
    }

    console.log('ID: ' + peer.id);
});

peer.on('disconnected', function () {
    console.log('Connection lost. Please reconnect ******');

    //peer.id = lastPeerId;
    //peer._lastServerId = lastPeerId;
    //peer.reconnect();
});

peer.on('close', function() {
    console.log('Connection destroyed ******');
});

peer.on('error', function (err) {
    console.log(err + ' ******');
});

