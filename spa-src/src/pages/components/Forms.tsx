import { Card, Col, Container, Row } from "react-bootstrap";
import { Headcrumb } from "../../components/Headcrumb";

export function Forms() {
  return (
    <Container fluid>
      <Headcrumb parent="Components" title="Forms" />

      <Row>
        <Col md={7}>
          <Card className="mb-3">
            <Card.Body>
              <div className="bs-component">
                <form>
                  <fieldset>
                    <legend>Legend</legend>
                    <div className="row">
                      <label
                        htmlFor="staticEmail"
                        className="col-sm-2 col-form-label"
                      >
                        Email
                      </label>
                      <div className="col-sm-10">
                        <input
                          type="text"
                          readOnly
                          className="form-control-plaintext"
                          id="staticEmail"
                          defaultValue="email@example.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label mt-4"
                        >
                          Email address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          placeholder="Enter email"
                        />
                        <small id="emailHelp" className="form-text text-muted">
                          We'll never share your email with anyone else.
                        </small>
                      </div>
                      <div>
                        <label
                          htmlFor="exampleInputPassword1"
                          className="form-label mt-4"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="exampleInputPassword1"
                          placeholder="Password"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="exampleSelect1"
                          className="form-label mt-4"
                        >
                          Example select
                        </label>
                        <select className="form-select" id="exampleSelect1">
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="exampleSelect1"
                          className="form-label mt-4"
                        >
                          Example disabled select
                        </label>
                        <select
                          className="form-select"
                          id="exampleDisabledSelect1"
                          disabled
                        >
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="exampleSelect2"
                          className="form-label mt-4"
                        >
                          Example multiple select
                        </label>
                        <select
                          multiple
                          className="form-select"
                          id="exampleSelect2"
                        >
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="exampleTextarea"
                          className="form-label mt-4"
                        >
                          Example textarea
                        </label>
                        <textarea
                          className="form-control"
                          id="exampleTextarea"
                          rows={3}
                        ></textarea>
                      </div>
                      <div>
                        <label htmlFor="formFile" className="form-label mt-4">
                          Default file input example
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          id="formFile"
                        />
                      </div>
                    </div>
                    <fieldset>
                      <legend className="mt-4">Radio buttons</legend>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="optionsRadios"
                          id="optionsRadios1"
                          defaultValue="option1"
                          defaultChecked
                        />
                        <label
                          className="form-check-label"
                          htmlFor="optionsRadios1"
                        >
                          Option one is this and that&mdash;be sure to include
                          why it's great
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="optionsRadios"
                          id="optionsRadios2"
                          defaultValue="option2"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="optionsRadios2"
                        >
                          Option two can be something else and selecting it will
                          deselect option one
                        </label>
                      </div>
                      <div className="form-check disabled">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="optionsRadios"
                          id="optionsRadios3"
                          defaultValue="option3"
                          disabled
                        />
                        <label
                          className="form-check-label"
                          htmlFor="optionsRadios3"
                        >
                          Option three is disabled
                        </label>
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="mt-4">Checkboxes</legend>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="flexCheckDefault"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexCheckDefault"
                        >
                          Default checkbox
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="flexCheckChecked"
                          defaultChecked
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexCheckChecked"
                        >
                          Checked checkbox
                        </label>
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="mt-4">Switches</legend>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="flexSwitchCheckDefault"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexSwitchCheckDefault"
                        >
                          Default switch checkbox input
                        </label>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="flexSwitchCheckChecked"
                          defaultChecked
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexSwitchCheckChecked"
                        >
                          Checked switch checkbox input
                        </label>
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="mt-4">Ranges</legend>
                      <label htmlFor="customRange1" className="form-label">
                        Example range
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        id="customRange1"
                      />
                      <label htmlFor="disabledRange" className="form-label">
                        Disabled range
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        id="disabledRange"
                        disabled
                      />
                      <label htmlFor="customRange3" className="form-label">
                        Example range
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="5"
                        step="0.5"
                        id="customRange3"
                      />
                    </fieldset>

                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </fieldset>
                </form>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="mb-3">
            <Card.Body>
              <form className="bs-component">
                <div>
                  <fieldset disabled>
                    <label className="form-label" htmlFor="disabledInput">
                      Disabled input
                    </label>
                    <input
                      className="form-control"
                      id="disabledInput"
                      type="text"
                      placeholder="Disabled input here..."
                      disabled
                    />
                  </fieldset>
                </div>

                <div>
                  <fieldset>
                    <label className="form-label mt-4" htmlFor="readOnlyInput">
                      Readonly input
                    </label>
                    <input
                      className="form-control"
                      id="readOnlyInput"
                      type="text"
                      placeholder="Readonly input here..."
                      readOnly
                    />
                  </fieldset>
                </div>

                <div className="has-success">
                  <label className="form-label mt-4" htmlFor="inputValid">
                    Valid input
                  </label>
                  <input
                    type="text"
                    defaultValue="correct value"
                    className="form-control is-valid"
                    id="inputValid"
                  />
                  <div className="valid-feedback">Success! You've done it.</div>
                </div>

                <div className="has-danger">
                  <label className="form-label mt-4" htmlFor="inputInvalid">
                    Invalid input
                  </label>
                  <input
                    type="text"
                    defaultValue="wrong value"
                    className="form-control is-invalid"
                    id="inputInvalid"
                  />
                  <div className="invalid-feedback">
                    Sorry, that username's taken. Try another?
                  </div>
                </div>

                <div>
                  <label
                    className="col-form-label col-form-label-lg mt-4"
                    htmlFor="inputLarge"
                  >
                    Large input
                  </label>
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder=".form-control-lg"
                    id="inputLarge"
                  />
                </div>

                <div>
                  <label className="col-form-label mt-4" htmlFor="inputDefault">
                    Default input
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Default input"
                    id="inputDefault"
                  />
                </div>

                <div>
                  <label
                    className="col-form-label col-form-label-sm mt-4"
                    htmlFor="inputSmall"
                  >
                    Small input
                  </label>
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    placeholder=".form-control-sm"
                    id="inputSmall"
                  />
                </div>

                <div>
                  <label className="form-label mt-4">Input addons</label>
                  <div>
                    <div className="input-group mb-3">
                      <span className="input-group-text">$</span>
                      <input
                        type="text"
                        className="form-control"
                        aria-label="Amount (to the nearest dollar)"
                      />
                      <span className="input-group-text">.00</span>
                    </div>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Recipient's username"
                        aria-label="Recipient's username"
                        aria-describedby="button-addon2"
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        id="button-addon2"
                      >
                        Button
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label mt-4">Floating labels</label>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="floatingInput"
                      placeholder="name@example.com"
                    />
                    <label htmlFor="floatingInput">Email address</label>
                  </div>
                  <div className="form-floating">
                    <input
                      type="password"
                      className="form-control"
                      id="floatingPassword"
                      placeholder="Password"
                      autoComplete="off"
                    />
                    <label htmlFor="floatingPassword">Password</label>
                  </div>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
