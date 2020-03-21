//== Class Definition
var SnippetLogin = function() {
    var login = $('#m_login');

    var showErrorMsg = function(form, type, msg) {
        var alert = $('<div class="m-alert m-alert--outline alert alert-' + type + ' alert-dismissible" role="alert">\
			<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>\
			<span></span>\
		</div>');

        form.find('.alert').remove();
        alert.prependTo(form);
        //alert.animateClass('fadeIn animated');
        mUtil.animateClass(alert[0], 'fadeIn animated');
        alert.find('span').html(msg);
    }

    //== Private Functions

    var displaySignUpForm = function() {
        login.removeClass('m-login--forget-password');
        login.removeClass('m-login--signin');

        login.addClass('m-login--signup');
        mUtil.animateClass(login.find('.m-login__signup')[0], 'flipInX animated');
    }

    var displaySignInForm = function() {
        login.removeClass('m-login--forget-password');
        login.removeClass('m-login--signup');

        login.addClass('m-login--signin');
        mUtil.animateClass(login.find('.m-login__signin')[0], 'flipInX animated');
        //login.find('.m-login__signin').animateClass('flipInX animated');
    }

    var displayForgetPasswordForm = function() {
        login.removeClass('m-login--signin');
        login.removeClass('m-login--signup');

        login.addClass('m-login--forget-password');
        //login.find('.m-login__forget-password').animateClass('flipInX animated');
        mUtil.animateClass(login.find('.m-login__forget-password')[0], 'flipInX animated');

    }

    var handleFormSwitch = function() {
        $('#m_login_forget_password').click(function(e) {
            e.preventDefault();
            displayForgetPasswordForm();
        });

        $('#m_login_forget_password_cancel').click(function(e) {
            e.preventDefault();
            displaySignInForm();
        });

        $('#m_login_signup').click(function(e) {
            e.preventDefault();
            displaySignUpForm();
        });

        $('#m_login_signup_cancel').click(function(e) {
            e.preventDefault();
            displaySignInForm();
        });
    }

    var handleSignInFormSubmit = function() {
        $('#m_login_signin_submit').click(function(e) {
            e.preventDefault();
            var btn = $(this);
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    email: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('m-loader m-loader--right m-loader--light').attr('disabled', true);

            var myUrl = 'http://185.37.53.121/liketeamviewer/Main/Check';
            var proxy = 'https://cors-anywhere.herokuapp.com/';

            var jsonData = {};
            var x = form.serializeArray();
            $.each(x, function(i, field){
                if(field.name === 'username')
                {
                    jsonData['email'] = field.value;
                }
                if(field.name === 'password')
                {
                    jsonData['password'] = field.value;
                }
            });

            $.post(proxy + myUrl, { Email: jsonData['email'], Password: jsonData['password'] })
                .done(function(response)
                {
                    btn.removeClass('m-loader m-loader--right m-loader--light').attr('disabled', false);
                    form.clearForm();
                    form.validate().resetForm();
                    var signInForm = login.find('.m-login__signin form');

                    switch (response) {
                        case '105':
                            // display signin form
                            displaySignInForm();
                            signInForm.clearForm();
                            signInForm.validate().resetForm();

                            showErrorMsg(signInForm, 'success', 'Perfect, You are logged in successfully. Please wait, You will be redirected to the Main Page.');
                            saveUserInfo(jsonData['email']);
                            setTimeout(function() {
                                location.replace('Main.html');
                            }, 3000);
                            break;

                        case '104':
                            // display signin form
                            displaySignInForm();
                            signInForm.validate().resetForm();

                            showErrorMsg(signInForm, 'danger', 'Sorry, Something went wrong.');
                            break;
                    }
                }).fail(function(x, y)
            {
                btn.removeClass('m-loader m-loader--right m-loader--light').attr('disabled', false);
                form.clearForm();
                form.validate().resetForm();

                // display signin form
                var signInForm = login.find('.m-login__signin form');
                displaySignInForm();
                signInForm.clearForm();
                signInForm.validate().resetForm();

                showErrorMsg(signInForm, 'danger', 'Sorry, Something went wrong.');
            });
        });
    }

    var handleSignUpFormSubmit = function() {
        $('#m_login_signup_submit').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    fullname: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true
                    },
                    rpassword: {
                        required: true
                    },
                    agree: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('m-loader m-loader--right m-loader--light').attr('disabled', true);

            var myUrl = 'http://185.37.53.121/liketeamviewer/Main/SignUp';
            var proxy = 'https://cors-anywhere.herokuapp.com/';

            var jsonData = {};
            var x = form.serializeArray();
            $.each(x, function(i, field){
                if(field.name === 'fullname')
                {
                    jsonData['fullname'] = field.value;
                }
                if(field.name === 'email')
                {
                    jsonData['email'] = field.value;
                }
                if(field.name === 'password')
                {
                    jsonData['password'] = field.value;
                }
            });

            $.post(proxy + myUrl, { FullName: jsonData['fullname'], Email: jsonData['email'], Password: jsonData['password'] })
            .done(function(response)
            {
                btn.removeClass('m-loader m-loader--right m-loader--light').attr('disabled', false);
                form.clearForm();
                form.validate().resetForm();
                var signUpForm = login.find('.m-login__signup form');

                switch (response) {
                    case '200':
                        // display signin form
                        displaySignInForm();
                        var signInForm = login.find('.m-login__signin form');
                        signInForm.clearForm();
                        signInForm.validate().resetForm();

                        showErrorMsg(signInForm, 'success', 'Perfect, You are signed up successfully. Now, you should log in.');
                        break;

                    case '500':
                        // display signup form
                        displaySignUpForm();
                        signUpForm.clearForm();
                        signUpForm.validate().resetForm();

                        showErrorMsg(signUpForm, 'danger', 'Sorry, Something went wrong.');
                        break;

                    case '501':
                        // display signup form
                        displaySignUpForm();
                        signUpForm.clearForm();
                        signUpForm.validate().resetForm();

                        showErrorMsg(signUpForm, 'danger', 'Sorry, Something went wrong.');
                        break;

                    case '502':
                        // display signup form
                        displaySignUpForm();
                        signUpForm.clearForm();
                        signUpForm.validate().resetForm();

                        showErrorMsg(signUpForm, 'danger', 'Sorry, Something went wrong.');
                        break;
                }
            }).fail(function(x, y)
            {
                btn.removeClass('m-loader m-loader--right m-loader--light').attr('disabled', false);
                form.clearForm();
                form.validate().resetForm();

                // display signup form
                displaySignUpForm()
                var signUpForm = login.find('.m-login__signup form');
                signUpForm.clearForm();
                signUpForm.validate().resetForm();

                showErrorMsg(signUpForm, 'danger', 'Sorry, Something failed. Try again later.');
            });

        });
    }

    var handleForgetPasswordFormSubmit = function() {
        $('#m_login_forget_password_submit').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            var form = $(this).closest('form');

            form.validate({
                rules: {
                    email: {
                        required: true,
                        email: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('m-loader m-loader--right m-loader--light').attr('disabled', true);

            var jsonData = {};
            var x = form.serializeArray();
            $.each(x, function(i, field){
                if(field.name === 'email')
                {
                    jsonData['email'] = field.value;
                }
            });
            var myUrl = 'http://185.37.53.121/liketeamviewer/Main/ResetPassword';
            var proxy = 'https://cors-anywhere.herokuapp.com/';

            var jsonData = {};
            var x = form.serializeArray();
            $.each(x, function(i, field){
                if(field.name === 'email')
                {
                    jsonData['email'] = field.value;
                }
            });

            $.post(proxy + myUrl, { Email: jsonData['email'] })
            .done(function(response)
            {
                btn.removeClass('m-loader m-loader--right m-loader--light').attr('disabled', false); // remove
                form.clearForm(); // clear form
                form.validate().resetForm(); // reset validation states
                displaySignInForm();
                var signInForm = login.find('.m-login__signin form');
                signInForm.clearForm();
                signInForm.validate().resetForm();

                switch (response) {
                    case '105':
                        showErrorMsg(signInForm, 'success', 'New password has been sent to your email.');
                        break;

                    case '104':
                        showErrorMsg(signInForm, 'danger', 'At first, you must be registered!');
                        break;
                }
            }).fail(function(x, y)
            {
                btn.removeClass('m-loader m-loader--right m-loader--light').attr('disabled', false); // remove
                form.clearForm(); // clear form
                form.validate().resetForm(); // reset validation states
                displaySignInForm();
                var signInForm = login.find('.m-login__signin form');
                signInForm.clearForm();
                signInForm.validate().resetForm();

                showErrorMsg(signInForm, 'danger', 'Sorry, Something went wrong.');
            });
        });
    }

    //== Public Functions
    return {
        // public functions
        init: function() {
            handleFormSwitch();
            handleSignInFormSubmit();
            handleSignUpFormSubmit();
            handleForgetPasswordFormSubmit();
        }
    };
}();

//== Class Initialization
jQuery(document).ready(function() {
    SnippetLogin.init();
});