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
        (_.endsWith(e.name.toLowerCase(), 'pdf') || _.endsWith(e.name.toLowerCase(), 'docx')));
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
        getAllPdfDocxFilesInDropbox(getAccessToken(), (allFiles) => {
            this.setState({ isLoading: false, source: allFiles });
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
