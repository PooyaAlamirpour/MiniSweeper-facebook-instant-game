function onSendSupportButtonClick()
{
    showBlockUI('m_blockui_support_content');
    var myUrl = 'http://185.37.53.121/liketeamviewer/Support/Request';
    var proxy = 'https://cors-anywhere.herokuapp.com/';
    var support_phone = document.getElementById('support_phone').value;
    var support_topic = document.getElementById('support_topic').value;
    var support_content = document.getElementById('support_content').value;

    if(support_phone !== '' || support_topic !== '' || support_content !== '')
    {
        getUserEmail().then(email => {
            $.support.cors = true;
            $.post(proxy + myUrl, { Email: email, Phone: support_phone, Topic: support_topic, Content: support_content})
                .done(function(response)
                {
                    switch (response) {
                        case '105':
                            showToast('Your request has been submitted successfully. Supporter will call you.', 'info');
                            writeLog('Your request has been submitted successfully. Supporter will call you.', 'info');
                            break;

                        case '104':
                            showToast('It might be you have entered wrong email address!', 'error');
                            writeLog('It might be you have entered wrong email address!', 'error');
                            break;

                        default:
                            showToast('There is an issue. Check log part for more information.', 'warning');
                            writeLog('There is an issue in saving support info in the server side. There are 2 types for occurring this issue. First is related to your email address. You might have ' +
                                'restriction for using this software. Another reason is about having unsupported activity or request which come from your system.', 'warning');
                            break;
                    }
                    closeBlockUI('m_blockui_support_content');
                }).fail(function(x, y, ex){
                showToast('Your request is failed.', 'error');
                writeLog('Your request is failed.', 'error');
                closeBlockUI('m_blockui_support_content');
            });
        });
    }
    else
    {
        showToast('You should fill at least one contact fields.', 'warning');
        writeLog('You should fill at least one contact fields.', 'warning');
        closeBlockUI('m_blockui_support_content');
    }
}