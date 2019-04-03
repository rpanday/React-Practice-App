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
            isLoading: false,
            results: [],
            source: props.source
        };
    }

    componentWillMount = () => {
        this.resetComponent();
    }

    resetComponent = () => {
        this.setState({ isLoading: false, results: [], value: '' });
    }

    handleResultSelect = (e, { result }) => {
        this.setState({ value: result.title });
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
                        <Header>State</Header>
                        <pre style={{ overflowX: 'auto' }}>{JSON.stringify(this.state, null, 2)}</pre>
                        <Header>Options</Header>
                        <pre style={{ overflowX: 'auto' }}>{JSON.stringify(source, null, 2)}</pre>
                    </Segment>
                </Grid.Column>
            </Grid>
        );
    }
}
