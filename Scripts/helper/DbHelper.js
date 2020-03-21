
function setUserSessionHistoryTbl(SessionId)
{
    if(SessionId.includes(' '))
    {
        var tmpSessionId = SessionId.replace(' ', '_');
        var db = new PouchDB(ClientConfigurationDbName);
        db.get(tmpSessionId).then(function (doc) {
            doc.LastConnectionDate = getDateTime();
            db.put(doc);
            console.log('Thumbnail is updated');
        }).then(function () {
        }).catch(function (err) {
            var newDoc = {
                "_id": tmpSessionId,
                "SessionID": SessionId,
                "LastConnectionDate": getDateTime(),
                "ImageUrl": thumbnail_folder + tmpSessionId
            };
            db.put(newDoc).catch(function (err) {
                showToast('There is an issue in saving user session: ' + err, 'warning');
            });
        });
    }
}

function mapUserSessionHistoryTbl(doc) {
    if(doc._id === UserConfigTableName)
    {

    }
    else
    {
        emit([doc.SessionID, doc.ImageUrl, doc.LastConnectionDate]);
    }
}

async function loadLast3Sessions()
{
    var options = {limit: 3, descending: false, include_docs: true};
    let promise = new Promise((resolve, reject) => {
        var db = new PouchDB(ClientConfigurationDbName);
        db.allDocs(options, function (err, response) {
            if(err === null)
            {
                resolve(response);
            }
            else
            {
                reject(err);
            }
        });

    });
    let result = await promise;
    return result;
}

async function getSessionIdByIndex(index)
{
    let promise = new Promise((resolve, reject) => {
        loadLast3Sessions().then(value => {
            if(value.total_rows > 0)
            {
                if(value.rows[index].doc.SessionID !== undefined)
                {
                    resolve(value.rows[index].doc.SessionID);
                }
                else
                {
                    reject(0);
                }
            }
        }).catch(error => {
            console.log(error);
            reject(0);
        });
    });
    let result = await promise;
    return result;
}

function saveUserInfo(email)
{
    console.log('Initialing Database...');
    var db = new PouchDB(ClientConfigurationDbName);

    db.get(UserInfoTableName).catch(function (err) {
        if (err.name === 'not_found') {
            console.log('00-Successfully the database is initialized.');
            db.put({
                _id: UserInfoTableName,
                Email: email
            }).then(function (response) {
                console.log('11-There is an especial response for initialing the database: ' + response);
            }).catch(function (err) {
                console.log('22-There is an exception in initialing the database: ' + err)
            });
        } else {
            console.log('33-There is an error in initialing the database: ' + err)
        }
    }).then(function (configDoc) {
        console.log('44-Successfully the database is configured.');
    }).catch(function (err) {
        console.log('55-There is an exception in initialing the database: ' + err)
    });
}

async function getUserEmail()
{
//    db.get(UserInfoTableName)
    let promise = new Promise((resolve, reject) => {
        var db = new PouchDB(ClientConfigurationDbName);
        db.get('UserInfoTableName').then(function (doc) {
            resolve(doc.Email);
        });
    });
    let result = await promise;
    return result;
}