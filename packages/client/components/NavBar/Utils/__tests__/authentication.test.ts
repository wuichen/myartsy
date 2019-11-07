import * as authentication from "../authentication"

describe("authentication", () => {
  let mediator

  beforeEach(() => {
    mediator = {
      trigger: jest.fn(),
    }
  })

  it("calls login mediator with correct parameters", () => {
    authentication.login(mediator)

    expect(mediator.trigger).toHaveBeenCalledWith("open:auth", {
      contextModule: "Header",
      destination: "http://localhost/",
      intent: "login",
      mode: "login",
      signupIntent: "login",
      trigger: "click",
    })
  })

  it("calls logout mediator with correct parameters", () => {
    authentication.logout(mediator)
    expect(mediator.trigger).toHaveBeenCalledWith("auth:logout")
  })

  it("calls signup mediator with correct parameters", () => {
    authentication.signup(mediator)
    expect(mediator.trigger).toHaveBeenCalledWith("open:auth", {
      contextModule: "Header",
      destination: "http://localhost/",
      intent: "signup",
      mode: "signup",
      signupIntent: "signup",
      trigger: "click",
    })
  })
})
