import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Search, Grid, Header, Segment } from 'semantic-ui-react';

export default class SearchBar extends React.Component {
    static propTypes = {
        source: PropTypes.array.isRequired
    }

    constructor (props) {
        super(props);
        this.state = {
            value: '',
            content: '',
            isLoading: false,
            results: [],
            source: props.source
        };
    }

    componentWillMount = () => {
        this.resetComponent();
    }

    resetComponent = () => {
        this.setState({ isLoading: false, results: [], value: '', content: '' });
    }

    handleResultSelect = (e, { result }) => {
        this.setState({ content: result.text });
    }

    handleSearchChange = (e, { value }) => {
        this.setState({ isLoading: true, value });

        setTimeout(() => {
            if (this.state.value.length < 1) return this.resetComponent();

            const re = new RegExp(_.escapeRegExp(this.state.value), 'i');
            const isMatch = result => re.test(result.text);

            this.setState({
                isLoading: false,
                results: _.filter(this.state.source, isMatch)
            });
        }, 300);
    }

    render () {
        const { isLoading, value, results, source } = this.state;

        return (
            <Grid>
                <Grid.Column width={6}>
                    <Search
                        loading={isLoading}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                        results={results}
                        value={value}
                        {...this.props}
                    />
                </Grid.Column>
                <Grid.Column width={10}>
                    <Segment>
                        <Header>File Content</Header>
                        <p style={{ overflowX: 'auto' }}>{this.state.content}</p>
                        <Header>All Files</Header>
                        <pre style={{ overflowX: 'auto' }}>{source.map((s, i) => (<p key={i}>{s.title}</p>))}</pre>
                    </Segment>
                </Grid.Column>
            </Grid>
        );
    }
}
