import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import SearchBar from './search';
import DropboxConnect from './dropbox-connect';
import DropBox from 'dropbox';

import "./style/main.less";

class Intro extends React.Component {
    render () {
        return (
            <div className="welcome">
                <h1>Dropbox doc search</h1>
                <p>This app connects to your dropbox and searches the contents of your files.</p>
            </div>
        );
    }
}

function getAccessToken () {
    var token = localStorage.getItem('access-token');
    if (!token) {
        var hash = document.location.hash;
        token = hash ? hash.split('&').filter(
            function (el) { if (el.match('access_token') !== null) return true; }
        )[0].split('=')[1] : null;

        if (token) {
            setAccessToken(token);
        }
    }
    return token || null;
}

function setAccessToken (token) {
    localStorage.setItem('access-token', token);
}

var filterPdfDocxFiles = (entries) => {
    return entries.filter(e => e['.tag'] === 'file' &&
        _.endsWith(e.name.toLowerCase(), 'txt'));
    // return entries.filter(e => e['.tag'] === 'file' &&
    //     (_.endsWith(e.name.toLowerCase(), 'pdf') || _.endsWith(e.name.toLowerCase(), 'docx')));
};

var allFiles = [];
var getAllPdfDocxFilesInDropboxContinue = (dbx, cursor, callback) => {
    dbx.filesListFolderContinue({ cursor: cursor })
        .then(
            (result) => {
                //console.log(result);
                allFiles = allFiles.concat(filterPdfDocxFiles(result.entries));
                if (result.has_more) {
                    getAllPdfDocxFilesInDropboxContinue(dbx, result.cursor, callback);
                } else {
                    callback(allFiles);
                }
            },
            (error) => {
                console.log(error);
            }
        );
};

var getAllPdfDocxFilesInDropbox = (token, callback) => {
    var dbx = new DropBox.Dropbox({ accessToken: token });
    dbx.filesListFolder({ path: '', recursive: true })
        .then(
            (result) => {
                //console.log(result);
                allFiles = allFiles.concat(filterPdfDocxFiles(result.entries));
                if (result.has_more) {
                    getAllPdfDocxFilesInDropboxContinue(dbx, result.cursor, callback);
                } else {
                    callback(allFiles);
                }
            },
            (error) => {
                console.log(error);
            }
        );
};

var downloadFileFromDropbox = (token, fileList, callback) => {
    var dbx = new DropBox.Dropbox({ accessToken: token });
    var nameContent = [];
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        dbx.filesDownload({ path: file.path_lower })
            .then(((name, response) => {
                var blob = response.fileBlob;
                var reader = new FileReader();
                reader.addEventListener("loadend", function () {
                    console.log(reader.result); // will print out file content
                    nameContent.push({
                        title: name,
                        text: reader.result
                    });

                    if (nameContent.length === fileList.length) {
                        callback(nameContent);
                    }
                });
                reader.readAsText(blob);
            }).bind(this, file.name))
            .catch((function (name, error) {
                console.log(error);
                nameContent.push({
                    title: name,
                    text: 'ERROR downloading file'
                });
                if (nameContent.length === fileList.length) {
                    callback(nameContent);
                }
            }).bind(this, file.name));
    }
};

class App extends React.Component {
    constructor () {
        super();
        this.state = {
            source: [],
            isLoading: false
        };
    }

    componentDidMount () {
        this.setState({ isLoading: true });
        const token = getAccessToken();
        getAllPdfDocxFilesInDropbox(token, (allFiles) => {
            //download file contents using dropbox & apache tika
            //and pass a list of {names,content} to search component as source
            downloadFileFromDropbox(token, allFiles, (nameNContent) => {
                this.setState({ isLoading: false, source: nameNContent });
            });
        });
    }

    render () {
        const token = getAccessToken();
        if (token) {
            if (this.state.isLoading) {
                return null;
            }
            console.log(this.state.source);
            return (
                <div>
                    <Intro />
                    <SearchBar source={this.state.source} />
                </div>
            );
        } else {
            return (
                <div>
                    <Intro />
                    <DropboxConnect />
                </div>
            );
        }
    }
}

// TODO: Switch to https://github.com/palmerhq/the-platform#stylesheet when it will be stable
const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

ReactDOM.render(<App />, document.getElementById('root'));
