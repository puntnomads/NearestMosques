import React, { Component, Fragment } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Table
} from "reactstrap";
import Amplify, { API } from "aws-amplify";
import aws_exports from "./aws-exports";
import "./App.css";

Amplify.configure(aws_exports);

class App extends Component {
  state = {
    postcode: "",
    mosques: []
  };
  addPostcodeToState = async event => {
    const postcode = event.target.value;
    this.setState({
      postcode
    });
  };
  submitForm(e) {
    e.preventDefault();
    const postcode = this.state.postcode;
    API.get("api", `/mosques?postcode=${postcode}`).then(response => {
      if (response.mosques.length > 0) {
        this.setState({
          mosques: response.mosques
        });
      }
    });
  }
  render() {
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <h2>Nearest Mosques</h2>
            <Form className="form" onSubmit={e => this.submitForm(e)}>
              <FormGroup>
                <Label>Postcode</Label>
                <Input
                  type="text"
                  name="postcode"
                  id="postcode"
                  placeholder="SG18 9PL"
                  onChange={e => {
                    this.addPostcodeToState(e);
                  }}
                />
              </FormGroup>
              <Button color="primary" size="lg" block>
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
        {this.state.mosques.length > 0 && (
          <Row>
            <Col sm="12" md={{ size: 6, offset: 3 }}>
              <Fragment>
                <h2>Mosques</h2>
                <Table striped>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.mosques.map((mosque, index) => (
                      <tr key={index}>
                        <th scope="row">{index + 1}</th>
                        <td>{mosque.name}</td>
                        <td>{`${mosque.distance} KM`}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Fragment>
            </Col>
          </Row>
        )}
      </Container>
    );
  }
}

export default App;
