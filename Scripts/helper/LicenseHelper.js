function checkLicense(callback)
{
    getUserEmail().then(email => {
        $.support.cors = true;
        var myUrl = 'http://185.37.53.121/liketeamviewer/LicenseManagment/Check';
        var proxy = 'https://cors-anywhere.herokuapp.com/';

        var jsonData = {};
        jsonData['email'] = email;
        console.log('email: ' + email);
        $.post(proxy + myUrl, { Email: jsonData['email'] })
        .done(function(response)
        {
            switch (response) {
                case '105':
                    callback('good');
                    console.log('User has agreement.');
                    break;

                case '104':
                    callback(null);
                    console.log('User does not have agreement.');
                    break;
            }
        }).fail(function(x, y)
        {
            callback(null);
            showToast('There is an issue in internet connection.', 'error');
            writeLog('There is an issue in internet connection.', 'error');
        });
    });
}