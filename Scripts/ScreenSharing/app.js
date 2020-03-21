// const { desktopCapturer } = require('electron')
// const signalR = require('@microsoft/signalr')
const {desktopCapturer} = require('electron');

let desktopSharing = false;
let localStream;
var recorder = new MRecordRTC();
let connection;
let subject;
let screenCastTimer;
let isStreaming = false;
const framepersecond = 10;
const screenWidth = 1280;
const screenHeight = 800;
var myChatHub = $.connection.realTimeHub;

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
    var id = ($('select').val()).replace(/window|screen/g, function(match) { return match + ":"; });
    onAccessApproved(id);
  } else {
    desktopSharing = false;
    if (localStream)
    {
      localStream.getTracks()[0].stop();
    }
    localStream = null;
    document.querySelector('button').innerHTML = "Enable Capture";

    recorder.stopRecording(function(url, type) {
      // document.querySelector(type).src = url;
      PushToServer(recorder);
    });

    $('select').empty();
    showSources();
  }
}

function StoreOneFrame() {
  desktopSharing = false;
  if (localStream)
  {
    localStream.getTracks()[0].stop();
  }
  localStream = null;
  document.querySelector('button').innerHTML = "Enable Capture";

  recorder.stopRecording(function(url, type) {
    //document.querySelector(type).src = url;
    PushToServer(recorder);
  });
}

function PushToServer(recorder)
{
  var userID = "User ID";
  var blob = recorder.getBlob();
  var formData = new FormData();
  var fileType = 'video';
  var fileName = fileType + '_' + getDateTime() + '.webm';
  formData.append(fileType + '-filename', fileName);
  formData.append(fileType + '_blob', blob.video);
  xhr('https://www.pcsoftwarecart.com/RealTimeApp/VideoRecorded/Upload', formData, function (fName) {
    console.log("File Name: " + fName);
    myChatHub.server.newVideoFrameAdded(fileName, userID);
  });
}

function onAccessApproved(desktop_id) {
  if (!desktop_id) {
    console.log('Desktop Capture access rejected.');
    return;
  }
  // desktopSharing = true;
  // document.querySelector('button').innerHTML = "Disable Capture";
  // console.log("Desktop sharing started.. desktop_id:" + desktop_id);
  navigator.webkitGetUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: desktop_id,
        minWidth: 1024,
        maxWidth: 1024,
        minHeight: 720,
        maxHeight: 720
      }
    }
  }, gotStream, getUserMediaError);

  function gotStream(stream) {
    recorder.addStream(stream);
    recorder.mediaType = {
      audio: false,
      video: true
    };

    recorder.startRecording();
    setTimeout(function () {
      StoreOneFrame();
    }, 300);

    localStream = stream;
    stream.onended = function() {
      if (desktopSharing) {
        //toggle();
      }
    };
  }

  function getUserMediaError(e) {
    console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
  }
}

$(document).ready(function() {
  showSources();
});

document.querySelector('button').addEventListener('click', function(e) {
  // toggle();
  Capture();
});

function Capture()
{
  var id = ($('select').val()).replace(/window|screen/g, function(match) { return match + ":"; });
  onAccessApproved(id);
  setTimeout(Capture, 5000);
}

$(function () {
  myChatHub.client.NewScreenCastAgent = function (agentName) {
    console.log("I received new agent.");
    console.log("Agent Name: " + agentName);
  };

  myChatHub.client.OnStreamCastDataReceived = function (stream, agentName) {
    console.log('-----------------------------');
    console.log("I received data.");
    console.log('FileName: ' + stream);
    console.log('User Id: ' + agentName);
    console.log('-----------------------------');
    document.querySelector('video').src = 'http://pcsoftwarecart.com/uploads/' + stream;
  };

  $.connection.hub.url = "http://139.99.3.111/signalr";
  jQuery.support.cors = false;
  $.connection.hub.logging = true;
  $.connection.hub.error(function(error) {
    alert(error);
  });

  $.connection.hub.start({ jsonp: true }).done(function () {
    console.log("Connected");
  }).fail(function (error) {
    console.error(error);
    alert('Connection Failed. Try again later.');
  });

  $.connection.hub.disconnected(function () {
    if ($.connection.hub.lastError) {
      alert("disconnected reason:" + $.connection.hub.lastError.message);
    }
    setTimeout(function () {
      $.connection.hub.start();
    }, 2000);
  });

});


