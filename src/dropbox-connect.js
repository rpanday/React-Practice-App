import React from 'react';

export default class DropboxConnect extends React.Component {
    render () {
        const link = "https://www.dropbox.com/oauth2/authorize?client_id=wbc3ico9085sgn3&response_type=token&redirect_uri=http://localhost:8080";
        return (
            <div className="connect">
                <a href={link}>
                    Connect Dropbox!
                </a>
            </div>
        );
    }
}
