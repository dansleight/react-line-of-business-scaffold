import { Headcrumb } from "../../components/Headcrumb";

export function Buttons() {
  return (
    <div className="container-fluid">
      <Headcrumb title="Containers" parent="Buttons" />

      <div className="row">
        <div className="col-lg-7">
          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Standard Buttons</div>
              <button type="button" className="btn btn-primary m-1">
                Primary
              </button>
              <button type="button" className="btn btn-secondary m-1">
                Secondary
              </button>
              <button type="button" className="btn btn-success m-1">
                Success
              </button>
              <button type="button" className="btn btn-info m-1">
                Info
              </button>
              <button type="button" className="btn btn-warning m-1">
                Warning
              </button>
              <button type="button" className="btn btn-danger m-1">
                Danger
              </button>
              <button type="button" className="btn btn-light m-1">
                Light
              </button>
              <button type="button" className="btn btn-dark m-1">
                Dark
              </button>
              <button type="button" className="btn btn-link m-1">
                Link
              </button>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Disabled Buttons</div>
              <button type="button" className="btn btn-primary disabled m-1">
                Primary
              </button>
              <button type="button" className="btn btn-secondary disabled m-1">
                Secondary
              </button>
              <button type="button" className="btn btn-success disabled m-1">
                Success
              </button>
              <button type="button" className="btn btn-info disabled m-1">
                Info
              </button>
              <button type="button" className="btn btn-warning disabled m-1">
                Warning
              </button>
              <button type="button" className="btn btn-danger disabled m-1">
                Danger
              </button>
              <button type="button" className="btn btn-light disabled m-1">
                Light
              </button>
              <button type="button" className="btn btn-dark disabled m-1">
                Dark
              </button>
              <button type="button" className="btn btn-link disabled m-1">
                Link
              </button>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Outline Buttons</div>
              <button type="button" className="btn btn-outline-primary m-1">
                Primary
              </button>
              <button type="button" className="btn btn-outline-secondary m-1">
                Secondary
              </button>
              <button type="button" className="btn btn-outline-success m-1">
                Success
              </button>
              <button type="button" className="btn btn-outline-info m-1">
                Info
              </button>
              <button type="button" className="btn btn-outline-warning m-1">
                Warning
              </button>
              <button type="button" className="btn btn-outline-danger m-1">
                Danger
              </button>
              <button type="button" className="btn btn-outline-light m-1">
                Light
              </button>
              <button type="button" className="btn btn-outline-dark m-1">
                Dark
              </button>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Split Buttons/Dropdown</div>

              <div
                className="btn-group m-1"
                role="group"
                aria-label="Button group with nested dropdown"
              >
                <button type="button" className="btn btn-primary">
                  Primary
                </button>
                <div className="btn-group" role="group">
                  <button
                    id="btnGroupDrop1"
                    type="button"
                    className="btn btn-primary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  ></button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="btnGroupDrop1"
                  >
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                  </div>
                </div>
              </div>

              <div
                className="btn-group m-1"
                role="group"
                aria-label="Button group with nested dropdown"
              >
                <button type="button" className="btn btn-success">
                  Success
                </button>
                <div className="btn-group" role="group">
                  <button
                    id="btnGroupDrop2"
                    type="button"
                    className="btn btn-success dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  ></button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="btnGroupDrop2"
                  >
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                  </div>
                </div>
              </div>

              <div
                className="btn-group m-1"
                role="group"
                aria-label="Button group with nested dropdown"
              >
                <button type="button" className="btn btn-info">
                  Info
                </button>
                <div className="btn-group" role="group">
                  <button
                    id="btnGroupDrop3"
                    type="button"
                    className="btn btn-info dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  ></button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="btnGroupDrop3"
                  >
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                  </div>
                </div>
              </div>

              <div
                className="btn-group m-1"
                role="group"
                aria-label="Button group with nested dropdown"
              >
                <button type="button" className="btn btn-danger">
                  Danger
                </button>
                <div className="btn-group" role="group">
                  <button
                    id="btnGroupDrop4"
                    type="button"
                    className="btn btn-danger dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  ></button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="btnGroupDrop4"
                  >
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                    <a className="dropdown-item" href="#">
                      Dropdown link
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Button Sizes</div>
              <button type="button" className="btn btn-primary btn-lg m-1">
                Large button
              </button>
              <button type="button" className="btn btn-primary m-1">
                Default button
              </button>
              <button type="button" className="btn btn-primary btn-sm m-1">
                Small button
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Block Buttons</div>
              <div className="d-grid gap-2">
                <button className="btn btn-lg btn-primary m-1" type="button">
                  Block button
                </button>
                <button className="btn btn-lg btn-primary m-1" type="button">
                  Block button
                </button>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Radios and Checkboxes</div>
              <div
                className="btn-group mb-2"
                role="group"
                aria-label="Basic checkbox toggle button group"
              >
                <input
                  type="checkbox"
                  className="btn-check"
                  id="btncheck1"
                  defaultChecked
                  autoComplete="off"
                />
                <label className="btn btn-primary" htmlFor="btncheck1">
                  Checkbox 1
                </label>
                <input
                  type="checkbox"
                  className="btn-check"
                  id="btncheck2"
                  autoComplete="off"
                />
                <label className="btn btn-primary" htmlFor="btncheck2">
                  Checkbox 2
                </label>
                <input
                  type="checkbox"
                  className="btn-check"
                  id="btncheck3"
                  autoComplete="off"
                />
                <label className="btn btn-primary" htmlFor="btncheck3">
                  Checkbox 3
                </label>
              </div>
              <div
                className="btn-group"
                role="group"
                aria-label="Basic radio toggle button group"
              >
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio1"
                  autoComplete="off"
                  defaultChecked
                />
                <label className="btn btn-outline-primary" htmlFor="btnradio1">
                  Radio 1
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio2"
                  autoComplete="off"
                  defaultChecked
                />
                <label className="btn btn-outline-primary" htmlFor="btnradio2">
                  Radio 2
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="btnradio"
                  id="btnradio3"
                  autoComplete="off"
                  defaultChecked
                />
                <label className="btn btn-outline-primary" htmlFor="btnradio3">
                  Radio 3
                </label>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Button Groups</div>
              <div>
                <div className="btn-group-vertical mb-2">
                  <button type="button" className="btn btn-primary">
                    Button
                  </button>
                  <button type="button" className="btn btn-primary">
                    Button
                  </button>
                  <button type="button" className="btn btn-primary">
                    Button
                  </button>
                  <button type="button" className="btn btn-primary">
                    Button
                  </button>
                  <button type="button" className="btn btn-primary">
                    Button
                  </button>
                  <button type="button" className="btn btn-primary">
                    Button
                  </button>
                </div>
              </div>

              <div
                className="btn-group mb-2"
                role="group"
                aria-label="Basic example"
              >
                <button type="button" className="btn btn-secondary">
                  Left
                </button>
                <button type="button" className="btn btn-secondary">
                  Middle
                </button>
                <button type="button" className="btn btn-secondary">
                  Right
                </button>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body">
              <div className="card-title push-up">Toolbar</div>
              <div
                className="btn-toolbar"
                role="toolbar"
                aria-label="Toolbar with button groups"
              >
                <div
                  className="btn-group me-2"
                  role="group"
                  aria-label="First group"
                >
                  <button type="button" className="btn btn-secondary">
                    1
                  </button>
                  <button type="button" className="btn btn-secondary">
                    2
                  </button>
                  <button type="button" className="btn btn-secondary">
                    3
                  </button>
                  <button type="button" className="btn btn-secondary">
                    4
                  </button>
                </div>

                <div
                  className="btn-group me-2"
                  role="group"
                  aria-label="Second group"
                >
                  <button type="button" className="btn btn-secondary">
                    5
                  </button>
                  <button type="button" className="btn btn-secondary">
                    6
                  </button>
                  <button type="button" className="btn btn-secondary">
                    7
                  </button>
                </div>
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Third group"
                >
                  <button type="button" className="btn btn-secondary">
                    8
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
