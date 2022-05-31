import React, { Component } from 'react'
import Container from 'react-bootstrap/esm/Container';
import Form from 'react-bootstrap/esm/Form';
import Button from 'react-bootstrap/esm/Button';
import Alert from 'react-bootstrap/esm/Alert';
import InputGroup from 'react-bootstrap/esm/InputGroup';
import FormControl from 'react-bootstrap/esm/FormControl';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Card from 'react-bootstrap/esm/Card';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import ListGroupItem from 'react-bootstrap/esm/ListGroupItem';
import Collapse from 'react-bootstrap/esm/Collapse'
import { ChevronDown } from 'react-bootstrap-icons';
import HistoryMap from './HistoryMap'

export default class UserHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            tracked_username: '',
            history: [],
            opened: { id: null, histories: [] },
            error: { show: false, text: '' },
            center: null,
            zoom: null,
            activePopup: null
        };
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    handleFindUser = async (event) => {
        event.preventDefault();

        const { username, tracked_username } = this.state

        // if (!this.intervalId) {
        //     return this.setState({ tracked_username: username }, () => {
        //         this.fetchHistory().then((res) => {
        //             console.log('fetch ', res);
        //             if (res)
        //                 this.intervalId = setInterval(this.fetchHistory, 1000 * 1)
        //         });
        //     });
        // }

        if (tracked_username === username) return;

        if (this.intervalId || tracked_username !== username) {
            clearInterval(this.intervalId);
        }

        return this.setState({ tracked_username: username, history: [] }, () => {
            this.fetchHistory().then((res) => {
                console.log('fetch ', res);
                if (res)
                    this.intervalId = setInterval(this.fetchHistory, 1000 * 1)
            });
        });
    }


    fetchHistory = async (event) => {
        const { tracked_username } = this.state

        const res = await fetch('http://localhost:3001/users/name/' + tracked_username);

        const data = await res.json();
        if (data.message !== undefined || !Array.isArray(data)) {
            this.setState({ error: { show: true, text: data.message } });
            return false;
        }
        if (data.length === 0) return false;

        this.setState({ history: data, error: { show: false, text: '' } });
        return true;
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    closeAlert = () => {
        let error = this.state.error;
        error.show = false;
        this.setState({ error: error });
    };

    handleMoreHistory = (history_id) => {
        let opened = this.state.opened;
        let id = opened.id;
        opened.id = id && id === history_id ? null : history_id;
        opened.histories = [];

        const found = this.state.history.find(element => element._id === history_id);

        this.setState({
            opened: opened,
            center: [found.history[0].position.latitude, found.history[0].position.longitude],
            zoom: 13
        });
    }

    handleMoreData = (data_id) => {
        let opened = this.state.opened;
        let ids = opened.histories;
        if (ids.includes(data_id)) {
            var index = ids.indexOf(data_id);
            if (index !== -1) {
                ids.splice(index, 1);
            }
        }
        else {
            ids.push(data_id);
        }
        opened.histories = ids;

        let found;
        this.state.history.forEach(element => {
            found = element.history.find(obj => {
                return obj._id === data_id;
            });
        });

        let center = found ? [found.position.latitude, found.position.longitude] : this.state.center
        this.setState({
            opened: opened,
            center: center,
            zoom: 15,
            activePopup: data_id
        });
    }

    renderHistory(history) {
        let startedAt = new Date(history.startedAt).toLocaleString();
        let opened = this.state.opened.id === history._id;
        return (
            <Col key={history._id}>
                <Card>
                    <Card.Header>
                        {startedAt}
                    </Card.Header>
                    <Card.Body>
                        <Card.Title>
                            {history.user.username}
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{history.finished ? "Finished" : "Active"}</Card.Subtitle>
                    </Card.Body>
                    <Button variant="outline-secondary" className="no-corners" onClick={() => this.handleMoreHistory(history._id)}>
                        See more
                    </Button>
                    <Collapse in={opened}>
                        <ListGroup className="list-group-flush">
                            {history.history.map((data) => {
                                let eventCreatedAt = new Date(data.createdAt).toLocaleString();
                                let opened = this.state.opened.histories.includes(data._id)
                                return (
                                    <ListGroupItem key={data._id}>
                                        <Row>
                                            <Col>
                                                {eventCreatedAt}
                                            </Col>
                                            <Col className="col-auto">
                                                <Button size="sm" onClick={() => this.handleMoreData(data._id)}>
                                                    <ChevronDown size={20} />
                                                </Button>
                                            </Col>
                                        </Row>
                                        <Collapse in={opened}>
                                            <dl>
                                                <dt>Position:</dt>
                                                <dd>Lat: {data.position.latitude.toFixed(4)}, Long: {data.position.longitude.toFixed(4)}</dd>
                                                <dd>Speed: {data.position.speed.toFixed(2)}</dd>

                                                <dt>Accelerometer:</dt>
                                                <dd>{data.accelerometer.x.toFixed(2)}, {data.accelerometer.y.toFixed(2)}, {data.accelerometer.z.toFixed(2)}</dd>

                                                <dt>Magnetometer:</dt>
                                                <dd>{data.magnetometer.x.toFixed(2)}, {data.magnetometer.y.toFixed(2)}, {data.magnetometer.z.toFixed(2)}</dd>
                                            </dl>
                                        </Collapse>
                                    </ListGroupItem>)
                            })}
                        </ListGroup>
                    </Collapse>
                </Card>
            </Col>
        )
    }

    render() {
        const { username, history, error, center, zoom, activePopup } = this.state;
        return (
            <Container>
                <Row>
                    <Col>
                        <Alert variant="danger" show={error.show} onClose={this.closeAlert} dismissible>
                            {error.text}
                        </Alert>
                        <Form onSubmit={this.handleFindUser}>
                            <InputGroup className="my-3">
                                <FormControl
                                    placeholder="Username"
                                    aria-label="Username"
                                    aria-describedby="basic-addon2"
                                    name="username"
                                    value={username}
                                    onChange={this.handleChange}
                                />
                                <Button type="submit" variant="primary" id="button-addon2">
                                    Find user
                                </Button>
                            </InputGroup>
                        </Form>
                        {history.length === 0 ?
                            <h5 className="text-center">Enter username and see his history</h5>
                            :
                            <Row xs={1} md={2} className="g-4 mb-2">
                                {history.map((data) => this.renderHistory(data))}
                            </Row>
                        }
                    </Col>
                    <Col>
                        <HistoryMap history={history} center={center} zoom={zoom} activePopup={activePopup} reset={this.resetState} />
                    </Col>
                </Row>
            </Container>
        )
    }
}
