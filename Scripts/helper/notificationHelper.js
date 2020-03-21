var path = require('path');

function showNotification(message)
{
    let icon_path = path.resolve('./public/icons/chat.png');
    const notification = {
        title: 'Chat message',
        body: message,
        icon: icon_path
    };
    let chat_area = document.getElementById('m_quick_sidebar');
    if(!chat_area.classList.contains('m-quick-sidebar--on'))
    {
        const myNotification = new window.Notification(notification.title, notification);
        myNotification.onclick = () => {
            document.getElementById('m_quick_sidebar_toggle').click();
        };
    }
}

function plasyNotification()
{
    let sound_path = path.resolve('./public/sounds/chat.mp3');
    const noise = new Audio(sound_path);
    noise.play();
}