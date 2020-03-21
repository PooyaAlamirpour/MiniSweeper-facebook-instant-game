function showBlockUI(content_id)
{
    mApp.block('#' + content_id + '', {
        overlayColor: '#000000',
        type: 'loader',
        state: 'success',
        message: '<h5>Please wait...</h5>'
    });
}

function closeBlockUI(content_id) {
    mApp.unblock('#' + content_id);
}