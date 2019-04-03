import React from 'react';
import DropBox from 'dropbox';

export default class DropboxConnect extends React.Component {
    getAccessToken = () => {
        var dbx = new DropBox.Dropbox({ clientId: 'wbc3ico9085sgn3' });
        var token = dbx.getAccessToken();
        if (token) {
            localStorage.setItem('access-token', token);
        }
        return false;
    }

    render () {
        const link = "https://www.dropbox.com/oauth2/authorize?client_id=wbc3ico9085sgn3&response_type=token&redirect_uri=" + document.location.origin;
        return (
            <div className="connect">
                <a href={link} onClick={this.getAccessToken}>
                    Connect Dropbox!
                </a>
            </div>
        );
    }
}
