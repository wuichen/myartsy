import { routes } from "Apps/Order/routes"
import { SystemContextProvider } from "Artsy"
import { ErrorPage } from "Components/ErrorPage"
import { mount } from "enzyme"
import { Resolver } from "found-relay"
import createRender from "found/lib/createRender"
import getFarceResult from "found/lib/server/getFarceResult"
import React from "react"
import { HeadProvider, Meta } from "react-head"
import { OrderApp } from "../OrderApp"

import {
  BuyOrderPickup,
  BuyOrderWithShippingDetails,
  OfferOrderWithShippingDetails,
  OfferWithTotals,
  UntouchedBuyOrder,
  UntouchedOfferOrder,
} from "Apps/__tests__/Fixtures/Order"
import { MockBoot } from "DevTools"
import { createMockNetworkLayer2 } from "DevTools/createMockNetworkLayer"
import { DateTime } from "luxon"
import { Environment, RecordSource, Store } from "relay-runtime"

jest.mock("react-stripe-elements", () => ({
  Elements: ({ children }) => children,
  StripeProvider: ({ children }) => children,
  CardElement: () => jest.fn(),
  injectStripe: () => jest.fn(),
}))

describe("OrderApp routing redirects", () => {
  // FIXME: move to DevTools folder
  async function render(url, mockData) {
    const network = createMockNetworkLayer2({ mockData })
    const source = new RecordSource()
    const store = new Store(source)
    const environment = new Environment({ network, store })

    const result = await getFarceResult({
      url,
      routeConfig: routes,
      resolver: new Resolver(environment),
      render: createRender({}),
    })

    return result
  }

  const mockResolver = data => ({ order: data, me: { name: "Alice Jane" } })

  it("does not redirect to the status route if the order is pending", async () => {
    const { redirect } = await render(
      "/orders/1234/shipping",
      mockResolver({
        ...BuyOrderPickup,
        id: 1234,
        state: "PENDING",
      })
    )
    expect(redirect).toBe(undefined)
  })

  it("redirects to the status route if the order is not pending", async () => {
    const { redirect } = await render(
      "/orders/1234/shipping",
      mockResolver({
        ...BuyOrderPickup,
        id: 1234,
        state: "SUBMITTED",
      })
    )
    expect(redirect.url).toBe("/orders/1234/status")
  })

  it("redirects to the artwork page if the order is abandoned", async () => {
    const { redirect } = await render(
      "/orders/1234/shipping",
      mockResolver({
        ...BuyOrderPickup,
        id: 1234,
        state: "ABANDONED",
        lineItems: {
          edges: [
            {
              node: {
                artwork: {
                  id: "artwork-id",
                  is_acquireable: true,
                  is_offerable: false,
                },
              },
            },
          ],
        },
      })
    )
    expect(redirect.url).toBe("/artwork/artwork-id")
  })

  it("redirects to the home page if the order is abandoned and has no ID", async () => {
    const { redirect } = await render(
      "/orders/1234/shipping",
      mockResolver({
        ...BuyOrderPickup,
        id: 1234,
        state: "ABANDONED",
        lineItems: null,
      })
    )
    expect(redirect.url).toBe("/")
  })

  it("stays on the shipping route if no shipping option is set", async () => {
    const { redirect } = await render(
      "/orders/1234/shipping",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "PENDING",
        requestedFulfillment: null,
      })
    )
    expect(redirect).toBe(undefined)
  })

  it("redirects to the shipping route from the payment route if no shipping option was set", async () => {
    const { redirect } = await render(
      "/orders/1234/payment",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "PENDING",
        requestedFulfillment: null,
      })
    )
    expect(redirect.url).toBe("/orders/1234/shipping")
  })

  it("stays on the payment route if there is shipping but no payment info", async () => {
    const { redirect } = await render(
      "/orders/1234/payment",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "PENDING",
        requestedFulfillment: {
          __typename: "CommerceShip",
        },
        creditCard: null,
      })
    )
    expect(redirect).toBe(undefined)
  })

  it("redirects to the shipping route from the review route if no shipping option was set", async () => {
    const { redirect } = await render(
      "/orders/1234/review",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "PENDING",
        requestedFulfillment: null,
        creditCard: null,
      })
    )
    expect(redirect.url).toBe("/orders/1234/shipping")
  })

  it("redirects to the payment route from the review route if no credit card is set", async () => {
    const { redirect } = await render(
      "/orders/1234/review",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "PENDING",
        requestedFulfillment: {
          __typename: "CommerceShip",
        },
        creditCard: null,
      })
    )
    expect(redirect.url).toBe("/orders/1234/payment")
  })

  it("stays on the review route if there are payment and shipping options set", async () => {
    const { redirect } = await render(
      "/orders/1234/review",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "PENDING",
        requestedFulfillment: {
          __typename: "CommerceShip",
        },
        creditCard: {
          id: "12345",
        },
      })
    )
    expect(redirect).toBe(undefined)
  })

  it("redirects from the status route to the review route if the order is pending", async () => {
    const { redirect } = await render(
      "/orders/1234/status",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "PENDING",
        requestedFulfillment: {
          __typename: "CommerceShip",
        },
        creditCard: {
          id: "12345",
        },
      })
    )
    expect(redirect.url).toBe("/orders/1234/review")
  })

  it("stays on the status page if the order is submitted", async () => {
    const { redirect } = await render(
      "/orders/1234/status",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        state: "SUBMITTED",
        requestedFulfillment: {
          __typename: "CommerceShip",
        },
        creditCard: {
          id: "12345",
        },
      })
    )
    expect(redirect).toBe(undefined)
  })

  it("stays on the offer route if the order is an offer order", async () => {
    const { redirect } = await render(
      "/orders/1234/offer",
      mockResolver({
        ...UntouchedOfferOrder,
        id: 1234,
        requestedFulfillment: null,
      })
    )
    expect(redirect).toBe(undefined)
  })

  it("redirects from the offer route to the shipping route if the order is not an offer order", async () => {
    const { redirect } = await render(
      "/orders/1234/offer",
      mockResolver({
        ...UntouchedBuyOrder,
        id: 1234,
        requestedFulfillment: null,
      })
    )
    expect(redirect.url).toBe("/orders/1234/shipping")
  })

  it("redirects from the offer route to the status route if the order is not pending", async () => {
    const { redirect } = await render(
      "/orders/1234/offer",
      mockResolver({
        ...BuyOrderWithShippingDetails,
        id: 1234,
        state: "SUBMITTED",
      })
    )
    expect(redirect.url).toBe("/orders/1234/status")
  })

  it("redirects from the respond route to the status route if not offer order", async () => {
    const { redirect } = await render(
      "/orders/1234/respond",
      mockResolver({
        ...BuyOrderWithShippingDetails,
        id: 1234,
        state: "SUBMITTED",
      })
    )
    expect(redirect.url).toBe("/orders/1234/status")
  })

  it("redirects from the respond route to the status route if order is not submitted", async () => {
    const { redirect } = await render(
      "/orders/1234/respond",
      mockResolver({
        ...OfferOrderWithShippingDetails,
        id: 1234,
        state: "PENDING",
        awaitingResponseFrom: "BUYER",
      })
    )
    expect(redirect.url).toBe("/orders/1234/status")
  })

  it("Stays on the respond page if all the appropriate conditions are met", async () => {
    const { redirect } = await render(
      "/orders/1234/respond",
      mockResolver({
        ...OfferOrderWithShippingDetails,
        id: 1234,
        state: "SUBMITTED",
        awaitingResponseFrom: "BUYER",
      })
    )
    expect(redirect).toBe(undefined)
  })

  it("Redirects from the status route to the respond route if awaiting buyer response", async () => {
    const { redirect } = await render(
      "/orders/1234/status",
      mockResolver({
        ...OfferOrderWithShippingDetails,
        id: 1234,
        state: "SUBMITTED",
        awaitingResponseFrom: "BUYER",
      })
    )
    expect(redirect.url).toBe("/orders/1234/respond")
  })

  describe("visiting the /review/counter page", () => {
    const counterOfferOrder = {
      ...OfferOrderWithShippingDetails,
      id: 1234,
      state: "SUBMITTED",
      lastOffer: {
        ...OfferWithTotals,
        id: "last-offer",
        createdAt: DateTime.local()
          .minus({ days: 1 })
          .toString(),
      },
      myLastOffer: {
        id: "my-last-offer",
        createdAt: DateTime.local().toString(),
      },
      awaitingResponseFrom: "BUYER",
    }
    it("stays on the /review/counter page if all conditions are met", async () => {
      const { redirect } = await render(
        "/orders/1234/review/counter",
        mockResolver(counterOfferOrder)
      )
      expect(redirect).toBe(undefined)
    })
    // goToStatusIfNotOfferOrder,
    it("redirects to /status if not an offer order", async () => {
      const { redirect } = await render(
        "/orders/1234/review/counter",
        mockResolver({
          ...counterOfferOrder,
          mode: "BUY",
        })
      )
      expect(redirect.url).toBe("/orders/1234/status")
    })
    // goToStatusIfNotAwaitingBuyerResponse,
    it("redirects to /status if not awaiting a buyer response", async () => {
      const { redirect } = await render(
        "/orders/1234/review/counter",
        mockResolver({
          ...counterOfferOrder,
          awaitingResponseFrom: "SELLER",
        })
      )
      expect(redirect.url).toBe("/orders/1234/status")
    })
    // goToStatusIfOrderIsNotSubmitted,
    it("redirects to /status if order is not submitted", async () => {
      const { redirect } = await render(
        "/orders/1234/review/counter",
        mockResolver({
          ...counterOfferOrder,
          state: "PENDING",
        })
      )
      expect(redirect.url).toBe("/orders/1234/status")
    })
    // goToRespondIfMyLastOfferIsNotMostRecentOffer,
    it("redirects to /respond if myLastOffer is not more recent than lastOffer", async () => {
      const { redirect } = await render(
        "/orders/1234/review/counter",
        mockResolver({
          ...counterOfferOrder,
          myLastOffer: {
            ...counterOfferOrder.myLastOffer,
            createdAt: DateTime.local()
              .minus({ days: 2 })
              .toString(),
          },
        })
      )
      expect(redirect.url).toBe("/orders/1234/respond")
    })
  })

  describe("visiting the /payment/new page", () => {
    const counterOfferOrder = {
      ...OfferOrderWithShippingDetails,
      id: 1234,
      state: "SUBMITTED",
      lastOffer: {
        ...OfferWithTotals,
        id: "last-offer",
        createdAt: DateTime.local()
          .minus({ days: 1 })
          .toString(),
      },
      myLastOffer: {
        id: "my-last-offer",
        createdAt: DateTime.local().toString(),
      },
      awaitingResponseFrom: "BUYER",
      lastTransactionFailed: true,
    }
    it("stays on the /payment/new page if all conditions are met", async () => {
      const { redirect } = await render(
        "/orders/1234/payment/new",
        mockResolver(counterOfferOrder)
      )
      expect(redirect).toBe(undefined)
    })
    // goToStatusIfNotOfferOrder,
    it("redirects to /status if not an offer order", async () => {
      const { redirect } = await render(
        "/orders/1234/payment/new",
        mockResolver({
          ...counterOfferOrder,
          mode: "BUY",
        })
      )
      expect(redirect.url).toBe("/orders/1234/status")
    })
    // goToStatusIfOrderIsNotSubmitted,
    it("redirects to /status if order is not submitted", async () => {
      const { redirect } = await render(
        "/orders/1234/payment/new",
        mockResolver({
          ...counterOfferOrder,
          state: "PENDING",
        })
      )
      expect(redirect.url).toBe("/orders/1234/status")
    })

    it("redirects to /status if order does not have a failing last transaction", async () => {
      const { redirect } = await render(
        "/orders/1234/payment/new",
        mockResolver({
          ...counterOfferOrder,
          lastTransactionFailed: false,
        })
      )
      expect(redirect.url).toBe("/orders/1234/status")
    })
  })
})

describe("OrderApp", () => {
  const getWrapper = ({ props, context }: any) => {
    return mount(
      <MockBoot>
        <HeadProvider>
          <SystemContextProvider {...context}>
            <OrderApp {...props} />
          </SystemContextProvider>
        </HeadProvider>
      </MockBoot>
    )
  }
  beforeAll(() => {
    // @ts-ignore
    // tslint:disable-next-line:no-empty
    window.Stripe = () => {}

    window.sd = { STRIPE_PUBLISHABLE_KEY: "" }
  })

  const getProps = ({ state, location, replace }: any = {}) => {
    return {
      children: false,
      params: {
        orderID: "123",
      },
      location: { pathname: location || "/order/123/shipping" },
      router: {
        // tslint:disable-next-line:no-empty
        addTransitionHook: () => {},
        replace,
      },
      order: {
        ...UntouchedBuyOrder,
        state: state || "PENDING",
      },
      routeIndices: [],
      routes: [],
    }
  }

  it("enables intercom", () => {
    const trigger = jest.fn()
    const props = getProps()
    getWrapper({ props, context: { mediator: { trigger } } })
    expect(trigger).toHaveBeenCalledWith("enableIntercomForBuyers", {
      is_acquireable: true,
      is_offerable: false,
    })
  })

  it("adds a meta tag with 'view-port-fit=cover' when not Eigen", () => {
    const props = getProps() as any
    const subject = getWrapper({ props }) as any
    const viewportMetaTags = subject
      .find(Meta)
      .filterWhere(meta => meta.props().name === "viewport")
    expect(viewportMetaTags.first().html()).toMatch(
      '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5 viewport-fit=cover">'
    )
  })

  it("includes meta viewport tag if Eigen", () => {
    const props = getProps()
    const subject = getWrapper({ props, context: { isEigen: true } }) as any
    const viewportMetaTags = subject
      .find(Meta)
      .filterWhere(meta => meta.props().name === "viewport")
    expect(viewportMetaTags.length).toBe(1)
  })

  it("shows the sticky 'need help?' footer", () => {
    const props = getProps() as any
    const subject = getWrapper({ props }) as any
    expect(subject.text()).toMatch("Need help? Read our FAQ or ask a question.")
  })

  it("shows an error page if the order is missing", () => {
    const props = getProps()
    const subject = getWrapper({
      props: { ...props, order: null },
      context: { isEigen: true },
    })

    subject.find(ErrorPage)

    expect(subject.find(ErrorPage).text()).toContain(
      "Sorry, the page you were looking for doesn’t exist at this URL."
    )
  })
})
