var fs = require('fs');
const {dialog} = require('electron').remote;

function saveThumbnail(SessionId)
{
    var video = document.getElementById('videoSource');
    var canvas = document.getElementById('canvasId');
    var tmpSessionID = SessionId.replace(' ', '_');
    draw(video, canvas, tmpSessionID);
}

async function readThumbnail(SessionId)
{
    var tmpSessionID = SessionId.replace(' ', '_');
    let promise = new Promise((resolve, reject) => {
        try {
            fs.readFile(thumbnail_folder + tmpSessionID, function(err, data) {
                if(err === null)
                {
                    resolve(data);
                }
                else
                {
                    showToast('Failed to load the thumbnail for ' + SessionId + ' session: ' + err, 'warning');
                    reject('NaN');
                }
            });
        }
        catch(e)
        {
            showToast('Failed to load the thumbnail for ' + SessionId + ' session: ' + e, 'warning');
            reject('NaN');
        }
    });
    let result = await promise;
    return result;
}

function checkDownloadSharedFolder()
{
    checkDirectorySync(abs_desktop_path + '\\Downloads');
    checkDirectorySync(abs_desktop_path + download_shared_path);
}

function readFile(abs_path, callback)
{
    fs.readFile(abs_path, function(err, data) {
        if(err === null)
        {
            callback(data);
        }
        else
        {
            callback('NaN');
            showToast('Failed to load the selected file.', 'warning');
        }
    });
}

function saveFile(abs_path, content, callback)
{
    fs.writeFile(abs_path, content, (err) => {
        if (err) {
            callback("An error occurred during updating the file" + err.message, null);
        }
        else
        {
            callback(null, 'A file has been successfully transmitted.');
        }
    });
}

function checkDirectorySync(directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
}

function OpenDialogFileaAndSend(conn)
{
    var options = {
        title : "Select files for uploading to the client",
        buttonLabel : "Select",
        filters :[
            {name: 'Images', extensions: ['jpg', 'png', 'gif']},
            {name: 'Movies', extensions: ['mkv', 'avi', 'mp4']},
            {name: 'Compressed', extensions: ['zip', 'rar', '7z']},
            {name: 'All Files', extensions: ['*']}
        ],
        properties: ['openFile', 'singleSelections']
    };
    try {
        dialog.showOpenDialog(options).then(filePaths => {
            setTimeout(function()
            {
                readFile(filePaths.filePaths[0], function (data) {
					showBlockUI('helloBody');
                    showToast('Please wait for completing transferring file.', 'info');
                    writeLog('File is transmitting to the client.', 'info');
                    var filename = filePaths.filePaths[0].replace(/^.*[\\\/]/, '');

                    var tmp_array = new Uint8Array(data);//[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                    console.log('Length: ' + tmp_array.length);
                    var chunk_size = 1024 * 15000;
                    var total_chunk = (tmp_array.length % chunk_size) === 0 ? (tmp_array.length / chunk_size) : (Math.floor(tmp_array.length / chunk_size) + 1);
                    console.log('N: ' + total_chunk);
                    let index = 0;
                    let randId = Math.floor(Math.random()*(99999999 - 10000000+1) + 10000000);
                    for (let i = 0; i < tmp_array.length; i++)
                    {
                        let percentage = Math.floor((index * 100) / total_chunk);

                        if((chunk_size * (index + 1)) > tmp_array.length)
                        {
                            var new_data = tmp_array.slice(index * chunk_size, tmp_array.length);
                            sendFileToHost(new_data, filename, randId, 'END', total_chunk, index, new_data.length);
                            break;
                        }
                        else
                        {
                            var new_data = tmp_array.slice(index * chunk_size, index * chunk_size + chunk_size);
                            sendFileToHost(new_data, filename, randId, 'START', total_chunk, index, new_data.length);
                        }
                        index++;
                    }
                });
            }, 1000);
        });
    }
    catch (e) {
        closeBlockUI('helloBody')
    }
}

function sendFileToHost(new_data, filename, randId, state, total_chunk, index, length) {
    conn.send({
        file: new_data,
        filename: filename,
        file_id : randId,
        file_status : state,
        total_chunk: total_chunk,
        chunk_index : index,
        chunk_length : length
    });
}

function draw(video, canvas, SessionId) {
    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    var dataURL = canvas.toDataURL();
    try {
        fs.writeFileSync(thumbnail_folder + SessionId, dataURL, 'utf-8');
    }
    catch(e)
    {
        showToast('Failed to save the thumbnail for ' + SessionId + ' session', 'warning');
    }
}

class PeerFile {
    constructor() {
        this.file_id = 0;
        this.file_name = 'NoName';
        this.file_content = [];
        this.file_status = 'NaN';
        this.abs_path = 'NoPath';
        this.total_chunk = 0;
        this.chunk_index = -1;
    }

    static get Status_Start() { return 'START'; }
    static get Status_End() { return 'END'; }
    static get Status_Cancel() { return 'CANCEL'; }
}

function handleSaveReceivedFile(data, callback)
{
    checkDownloadSharedFolder();
    if(data.file_status === PeerFile.Status_End)
    {
        if(data.chunk_length === 0)
        {
            try{
                collect_chunks(data, function(filepath){
                    showToast('A file is successfully sent from the Host', 'info');
                    shell.showItemInFolder(filepath);
                    callback(null, 'good');
                });
            }
            catch (e) {
                showToast('There is an erro in receiving file from the host', 'error');
                callback('There is an erro in receiving file from the host', null);
            }
        }
        else
        {
            saveChunk(data, function(err, succ)
            {
                if(err === null)
                {
                    try {
                        collect_chunks(data, function(filepath){
                            showToast('A file is successfully sent from the Host', 'info');
                            shell.showItemInFolder(filepath);
                            callback(null, 'good');
                        });
                    }
                    catch (e) {
                        showToast('There is an erro in receiving file from the host', 'error');
                        callback('There is an erro in receiving file from the host', null);
                    }
                }
                else
                {
                    showToast(err, 'warning');
                }
            });
        }
    }
    else
    {
        saveChunk(data, function(err, succ)
        {
            if(err !== null)
            {
                showToast(err, 'warning');
            }
        });
    }
}

function collect_chunks(data, callback)
{
    let filename = data.filename;
    let file_id = data.file_id;
    let total_chunk = data.total_chunk;
    let file_index_name = [];
    let abs_path = abs_desktop_path + download_shared_path + file_id;
    if(data.chunk_length === 0)
    {
        total_chunk--;
    }
    for (let i = 0; i < total_chunk; i++)
    {
        file_index_name.push(i);
    }
    let inputPathList = file_index_name.map(function (value) {
        return abs_path + value;
    });
    let savedPath = checkAndRename(abs_desktop_path + download_shared_path + filename);
    mergeFiles(inputPathList, savedPath).then(result => {
        if(result)
        {
            for (let i = 0; i < total_chunk; i++)
            {
                fs.unlinkSync(abs_desktop_path + download_shared_path + file_id + i);
            }
            callback(savedPath);
        }
        else
        {
            showToast('There is an issue in merging all chunks', 'error');
        }
    });
}

function getFilenameFromPath(fullPath)
{
    var filename = fullPath.replace(/^.*[\\\/]/, '');
    return filename;
}

function getFileExtensionFromPath(filename)
{
    return filename.split('.').pop();
}

function checkAndRename(abs_path)
{
    try {
        if (fs.existsSync(abs_path))
        {
            let filename = getFilenameFromPath(abs_path);
            let ext = '.' + getFileExtensionFromPath(filename);
            let pure_filename = filename.replace(ext, '');
            abs_path = abs_path.replace(filename, '');
            let new_path = abs_path + pure_filename + '(' + getSimpleTime() + ')' + ext;
            return new_path;
        }
        else
        {
            return abs_path;
        }
    } catch(err) {
        console.error(err)
        return abs_path;
    }
}

function mergeFiles(inputPathList, outputPath) {
    var fd = fs.openSync(outputPath, 'w+');
    var output = fs.createWriteStream(outputPath);
    var inputList = inputPathList.map((path) => {
        return fs.createReadStream(path);
    });
    return new Promise((resolve, reject) => {
        var multiStream = new MultiStream(inputList);
        multiStream.pipe(output);
        multiStream.on('end', () => {
            fs.closeSync(fd);
            resolve(true);
        });
        multiStream.on('error', () => {
            fs.closeSync(fd);
            reject(false);
        });
    });
}

function saveChunk(data, callback)
{
    const bytes = new Uint8Array(data.file);
    var abs_path = abs_desktop_path + download_shared_path + data.file_id + data.chunk_index;
    saveFile(abs_path, bytes, function(err, succ)
    {
        if(err === null)
        {
            // showToast(succ, 'info');
            callback(null, 'good');
        }
        else
        {
            // showToast(err, 'warning');
            callback(err, null);
        }
    });
}
