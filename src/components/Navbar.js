import React, { Component } from 'react'
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

export default class MyNavbar extends Component {


    render() {
        return (
            <Navbar bg="light" expand="lg" className="px-3">
                <LinkContainer to="/">
                    <Navbar.Brand>Traffic</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav>
                        <LinkContainer to="/users/history">
                            <Nav.Link>User history</Nav.Link>
                        </LinkContainer>
                    </Nav>
                </Navbar.Collapse>
            </Navbar >
        )
    }
}

