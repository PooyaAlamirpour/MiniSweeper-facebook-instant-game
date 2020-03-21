const shell = require('electron').shell;

function onChangePassword()
{
    document.getElementById('btnOpenModalChangePassword').click();
}

function closecloseChnagePassword()
{
    document.getElementById('btnCloseChangePasswordModal').click();
}

function callChangePassword()
{
    showBlockUI('m_blockui_change_password_content');
    var myUrl = 'http://185.37.53.121/liketeamviewer/Main/ChangePassword';
    var proxy = 'https://cors-anywhere.herokuapp.com/';
    var old_password = document.getElementById('old_password').value;
    var new_password1 = document.getElementById('new_password1').value;
    var new_password2 = document.getElementById('new_password2').value;

    if(new_password1 === new_password2)
    {
        getUserEmail().then(email => {
            $.support.cors = true;
            $.post(proxy + myUrl, { Email: email, Password: old_password, NewPassword: new_password1})
            .done(function(response)
            {
                switch (response) {
                    case '105':
                        showToast('Your password was changed successfully.', 'info');
                        writeLog('Your password was changed successfully.', 'info');
                        closecloseChnagePassword();
                        break;

                    case '104':
                        showToast('It might be you have entered wrong old password!', 'error');
                        writeLog('There is an issue during changing password. It might be you have entered wrong old password.', 'error');
                        break;
                }
                closeBlockUI('m_blockui_change_password_content');
            }).fail(function(x, y, ex){
                console.log('failed >>> x:' + ex + '-y: ' + y);
                showToast('Password changing is failed.', 'error');
                writeLog('Password changing is failed.', 'error');
                closecloseChnagePassword();
                closeBlockUI('m_blockui_change_password_content');
            });
        });
    }
    else
    {
        showToast('Passwords field must be same.', 'warning');
        writeLog('Passwords field must be same.', 'warning');
        closecloseChnagePassword();
        closeBlockUI('m_blockui_change_password_content');
    }
}

function onClientDownloadClick()
{
    shell.openExternal(download_link);
    showToast('Download client version of RemoteDesktop Application.', 'info');
    writeLog('Download client version of RemoteDesktop Application.', 'info');
}

function changeVersionStatus(status)
{
    document.getElementById('versionStatus').innerHTML = status;
}