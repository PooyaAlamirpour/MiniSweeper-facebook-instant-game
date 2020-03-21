//== Class definition
var ToastrDemo = function() {

    //== Private functions

    // basic demo
    var demo = function() {
        var i = -1;
        var toastCount = 0;
        var $toastlast;

        var getMessage = function () {
            var msgs = [
                'New order has been placed!',
                'Are you the six fingered man?',
                'Inconceivable!',
                'I do not think that means what you think it means.',
                'Have fun storming the castle!'
            ];
            i++;
            if (i === msgs.length) {
                i = 0;
            }

            return msgs[i];
        };

        var getMessageWithClearButton = function (msg) {
            msg = msg ? msg : 'Clear itself?';
            msg += '<br /><br /><button type="button" class="btn btn-outline-light btn-sm m-btn m-btn--air m-btn--wide clear">Yes</button>';
            return msg;
        };

        $('#showtoast').click(function () {
            var msg = $('#message').val();
            var title = $('#title').val() || '';
            var toastIndex = toastCount++;
            var addClear = $('#addClear').prop('checked');

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

            if (addClear) {
                msg = getMessageWithClearButton(msg);
                toastr.options.tapToDismiss = false;
            }
            if (!msg) {
                msg = getMessage();
            }

            var $toast = toastr['success']('msg', 'title'); // Wire up an event handler to a button in the toast, if it exists
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
        });

        function getLastToast(){
            return $toastlast;
        }
        $('#clearlasttoast').click(function () {
            toastr.clear(getLastToast());
        });
        $('#cleartoasts').click(function () {
            toastr.clear();
        });
    }

    return {
        // public functions
        init: function() {
            demo();
        }
    };
}();

jQuery(document).ready(function() {
    ToastrDemo.init();
});