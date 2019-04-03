import React from 'react';
import ReactDOM from 'react-dom';
import "./style/main.less";
import SearchBar from './search';
import DropboxConnect from './dropbox-connect';


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
    }

    if (token) {
        setAccessToken(token);
    }
    return token || null;
}

function setAccessToken (token) {
    localStorage.setItem('access-token', token);
}

class App extends React.Component {
    render () {
        if (getAccessToken()) {
            return (
                <div>
                    <Intro />
                    <SearchBar />
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
