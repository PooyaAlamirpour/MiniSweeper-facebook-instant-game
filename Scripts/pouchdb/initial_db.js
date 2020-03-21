function InitialDB()
{
    //deleteCurrentDatabas();

	console.log('Initialing Database...');
    var initial_data = getInitialData();
    var db = new PouchDB(ClientConfigurationDbName);

    db.get(UserConfigTableName).catch(function (err) {
        if (err.name === 'not_found') {
            console.log('0-Successfully the database is initialized.');
            db.put({
                _id: UserConfigTableName,
                ID: initial_data
            }).then(function (response) {
                console.log('1-There is an especial response for initialing the database: ' + response);
				installed(initial_data);
            }).catch(function (err) {
                console.log('2-There is an exception in initialing the database: ' + err)
            });
        } else {
            console.log('3-There is an error in initialing the database: ' + err)
        }
    }).then(function (configDoc) {
        console.log('4-Successfully the database is configured.');
    }).catch(function (err) {
        console.log('5-There is an exception in initialing the database: ' + err)
    });

}

function getInitialData()
{
    var rnd1 = Math.floor(Math.random()*(999-100+1)+100);
    var rnd2 = Math.floor(Math.random()*(999-100+1)+100);
	
    return rnd1 + ' ' + rnd2;
	
}

function installed(SessionId)
{
	$.support.cors = true;
	var myUrl = 'http://185.37.53.121/liketeamviewer/Download/incrementInstall';
	var proxy = 'https://cors-anywhere.herokuapp.com/';

	$.post(proxy + myUrl, { SessionId: SessionId })
	.done(function(response)
	{
		switch (response) {
			case '105':
				console.log('User is registered.');
				break;

			case '104':
				console.log('User is not registered.');
				break;
		}
	}).fail(function(x, y)
	{
		console.error('There is an issue in internet connection.');
	});
    
}

function deleteCurrentDatabas()
{
    var db = new PouchDB(ClientConfigurationDbName);
    db.destroy().then(function (response) {
        console.log('Deleted successfully');
    }).catch(function (err) {
        console.log('There is an error in deleting database: ' + err);
    });
}
