function CallJSONP(url , input_data,  success_callback, error_callback)
{
    $.ajax({
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        url: url,
        data: input_data,
        dataType: "jsonp",
        success: success_callback,
        error: error_callback
    });
}

function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.open('POST', url);
    request.send(data);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
}

function CallApi(url, data, protocol, callback) {
    $.support.cors = true;
    var myUrl = url;
    var proxy = '';//https://cors-anywhere.herokuapp.com/';
    var newURL = proxy + myUrl;
    var request = new XMLHttpRequest();
    request.open(protocol, newURL);
    request.setRequestHeader("Content-type", "application/json");
    request.send(data);

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
}