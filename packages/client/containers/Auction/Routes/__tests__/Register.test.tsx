import React from "react"
import { graphql } from "react-relay"

import * as Schema from "Artsy/Analytics/Schema"
import { ErrorModal } from "Components/Modal/ErrorModal"
import { ModalButton } from "Components/Modal/ModalDialog"
import { createTestEnv } from "DevTools/createTestEnv"
import { expectOne } from "DevTools/RootTestPage"

import { RegisterQueryResponseFixture } from "../../__fixtures__/routes_RegisterQuery"
import { createBidderSuccessful } from "../__fixtures__/MutationResults/createBidder"
import {
  createCreditCardAndUpdatePhoneFailed,
  createCreditCardAndUpdatePhoneSuccessful,
} from "../__fixtures__/MutationResults/createCreditCardAndUpdatePhone"
import { stripeTokenResponse } from "../__fixtures__/Stripe"
import { RegisterRouteFragmentContainer } from "../Register"
import { RegisterTestPage, ValidFormValues } from "./Utils/RegisterTestPage"

jest.unmock("react-relay")
jest.unmock("react-tracking")
jest.mock("Utils/Events", () => ({
  postEvent: jest.fn(),
}))
const mockPostEvent = require("Utils/Events").postEvent as jest.Mock

jest.mock("react-stripe-elements", () => {
  const stripeMock = {
    createToken: jest.fn(),
  }

  return {
    Elements: ({ children }) => children,
    StripeProvider: ({ children }) => children,
    CardElement: ({ onReady, hidePostalCode, ...props }) => <div {...props} />,
    __stripeMock: stripeMock,
    injectStripe: Component => props => (
      <Component stripe={stripeMock} {...props} />
    ),
  }
})

const setupCreateTokenMock = () => {
  const createTokenMock = require("react-stripe-elements").__stripeMock
    .createToken as jest.Mock

  createTokenMock.mockResolvedValue(stripeTokenResponse)
}
jest.mock("sharify", () => ({
  data: {
    APP_URL: "https://example.com",
  },
}))

const setupTestEnv = () => {
  return createTestEnv({
    TestPage: RegisterTestPage,
    Component: RegisterRouteFragmentContainer,
    query: graphql`
      query RegisterValidTestQuery {
        sale(id: "example-auction-id") {
          ...Register_sale
        }

        me {
          ...Register_me
        }
      }
    `,
    defaultData: RegisterQueryResponseFixture,
    defaultMutationResults: {
      createCreditCard: {},
      createBidder: {},
      updateMyUserProfile: {},
    },
  })
}

describe("Routes/Register ", () => {
  beforeAll(() => {
    // @ts-ignore
    // tslint:disable-next-line:no-empty
    window.Stripe = () => {}
  })

  beforeEach(() => {
    window.location.assign = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("emits a RegistrationSubmitFailed analytics event and halts submission", async () => {
    const env = setupTestEnv()
    const page = await env.buildPage()

    await page.submitForm()

    expect(mockPostEvent).toBeCalledWith({
      action_type: Schema.ActionType.RegistrationSubmitFailed,
      context_page: Schema.PageName.AuctionRegistrationPage,
      auction_slug: RegisterQueryResponseFixture.sale.id,
      auction_state: RegisterQueryResponseFixture.sale.status,
      error_messages: [
        "You must agree to the Conditions of Sale",
        "Name is required",
        "Address is required",
        "City is required",
        "State is required",
        "Postal code is required",
        "Telephone is required",
      ],
      sale_id: RegisterQueryResponseFixture.sale._id,
      user_id: RegisterQueryResponseFixture.me.id,
    })
    expect(mockPostEvent).toHaveBeenCalledTimes(1)

    expect(env.mutations.mockFetch).not.toBeCalled()
    expect(window.location.assign).not.toBeCalled()
  })

  it("successfully adds a credit card and registers the user as a bidder", async () => {
    const env = setupTestEnv()
    const page = await env.buildPage()

    setupCreateTokenMock()

    env.mutations.useResultsOnce(createCreditCardAndUpdatePhoneSuccessful)
    env.mutations.useResultsOnce(createBidderSuccessful)

    await page.fillFormWithValidValues()
    await page.submitForm()

    expect(mockPostEvent).toBeCalledWith({
      action_type: Schema.ActionType.RegistrationSubmitted,
      context_page: Schema.PageName.AuctionRegistrationPage,
      auction_slug: RegisterQueryResponseFixture.sale.id,
      auction_state: RegisterQueryResponseFixture.sale.status,
      bidder_id: createBidderSuccessful.createBidder.bidder.id,
      sale_id: RegisterQueryResponseFixture.sale._id,
      user_id: RegisterQueryResponseFixture.me.id,
    })
    expect(mockPostEvent).toHaveBeenCalledTimes(1)

    expect(window.location.assign).toHaveBeenCalledWith(
      `https://example.com/auction/${
        RegisterQueryResponseFixture.sale.id
      }/confirm-registration`
    )
  })

  it("displays an error modal if the `createCreditCard` mutation fails", async () => {
    const env = setupTestEnv()
    const page = await env.buildPage()

    setupCreateTokenMock()

    env.mutations.useResultsOnce(createCreditCardAndUpdatePhoneFailed)

    await page.fillFormWithValidValues()
    await page.submitForm()

    let errorModal = expectOne(page.find(ErrorModal))
    expect(errorModal.props().show).toBe(true)

    expectOne(errorModal.find(ModalButton)).simulate("click")

    errorModal = expectOne(page.find(ErrorModal))
    expect(errorModal.props().show).toBe(false)

    expect(mockPostEvent).toBeCalledWith({
      action_type: Schema.ActionType.RegistrationSubmitFailed,
      context_page: Schema.PageName.AuctionRegistrationPage,
      auction_slug: RegisterQueryResponseFixture.sale.id,
      auction_state: RegisterQueryResponseFixture.sale.status,
      error_messages: ["The `createCreditCard` mutation failed."],
      sale_id: RegisterQueryResponseFixture.sale._id,
      user_id: RegisterQueryResponseFixture.me.id,
    })
    expect(mockPostEvent).toHaveBeenCalledTimes(1)

    expect(window.location.assign).not.toBeCalled()
  })

  it("displays an error modal if the `createBidder` mutation fails", async () => {
    pending("until we can mimic Gravity-provided `createBidder` errors")
  })

  it("validates against an empty phone number", async () => {
    const env = setupTestEnv()
    const page = await env.buildPage()

    setupCreateTokenMock()

    const address = Object.assign({}, ValidFormValues)
    address.phoneNumber = "    "

    await page.fillAddressForm(address)
    await page.submitForm()

    expect(page.text()).toMatch("Telephone is required")
  })
})
