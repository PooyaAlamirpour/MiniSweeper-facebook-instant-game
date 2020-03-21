var i = -1;
var toastCount = 0;
var $toastlast;

function showToast(message, toastType)
{
    var toastIndex = toastCount++;

   toastr.options = {
        closeButton: true,
        debug: false,
        newestOnTop: false,
        progressBar: true,
        positionClass: 'toast-top-left',
        preventDuplicates: false,
        onclick: null
    };

    if ($('#addBehaviorOnToastClick').prop('checked')) {
        toastr.options.onclick = function () {
            alert('You can perform some custom action after a toast goes away');
        };
    }

    toastr.options.showDuration = 300;
    toastr.options.hideDuration = 1000;
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 1000;
    toastr.options.showEasing = 'swing';
    toastr.options.hideEasing = 'linear';
    toastr.options.showMethod = 'fadeIn';
    toastr.options.hideMethod = 'fadeOut';
    toastr.options.tapToDismiss = false;

    var $toast = toastr[toastType](message, '');
    $toastlast = $toast;

    if(typeof $toast === 'undefined'){
        return;
    }

    if ($toast.find('#okBtn').length) {
        $toast.delegate('#okBtn', 'click', function () {
            alert('you clicked me. i was toast #' + toastIndex + '. goodbye!');
            $toast.remove();
        });
    }
    if ($toast.find('#surpriseBtn').length) {
        $toast.delegate('#surpriseBtn', 'click', function () {
            alert('Surprise! you clicked me. i was toast #' + toastIndex + '. You could perform an action here.');
        });
    }
    if ($toast.find('.clear').length) {
        $toast.delegate('.clear', 'click', function () {
            toastr.clear($toast, { force: true });
        });
    }
}