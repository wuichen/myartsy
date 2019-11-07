import { getRedirect } from "Apps/Order/getRedirect"
import { confirmRouteExit, redirects } from "Apps/Order/redirects"
import { Redirect, RedirectException, RouteConfig } from "found"
import * as React from "react"
import { graphql } from "react-relay"
import { OrderApp } from "./OrderApp"

import { AcceptFragmentContainer as AcceptRoute } from "Apps/Order/Routes/Accept"
import { NewPaymentFragmentContainer as NewPaymentRoute } from "Apps/Order/Routes/NewPayment"
import { OfferFragmentContainer as OfferRoute } from "Apps/Order/Routes/Offer"
import { PaymentFragmentContainer as PaymentRoute } from "Apps/Order/Routes/Payment"
import { RejectFragmentContainer as RejectRoute } from "Apps/Order/Routes/Reject"
import { RespondFragmentContainer as RespondRoute } from "Apps/Order/Routes/Respond"
import { ReviewFragmentContainer as ReviewRoute } from "Apps/Order/Routes/Review"
import { ShippingFragmentContainer as ShippingRoute } from "Apps/Order/Routes/Shipping"
import { StatusFragmentContainer as StatusRoute } from "Apps/Order/Routes/Status"
import { CounterFragmentContainer as CounterRoute } from "./Routes/Counter"

// @ts-ignore
import { ComponentClass, StatelessComponent } from "react"

// @ts-ignore
import { ErrorPage } from "Components/ErrorPage"
// @ts-ignore
import { PaymentProps } from "./Routes/Payment"
// @ts-ignore
import { ReviewProps } from "./Routes/Review"
// @ts-ignore
import { ShippingProps } from "./Routes/Shipping"
// @ts-ignore
import { StatusProps } from "./Routes/Status"

// FIXME:
// * `render` functions requires casting
export const routes: RouteConfig[] = [
  {
    path: "/order(2|s)/:orderID",
    Component: OrderApp,
    // TODO: Better support `@principalField` in Metaphysics.
    // This currently only works because of the `order` field alias.
    query: graphql`
      query routes_OrderQuery($orderID: ID!) {
        me {
          name
        }
        order: commerceOrder(id: $orderID) @principalField {
          ...redirects_order @relay(mask: false)
          ...OrderApp_order @relay(mask: false)
        }
      }
    `,
    render: ({ Component, props }) => {
      if (Component && props) {
        const { location, order } = props as any

        if (order) {
          const redirect = getRedirect(
            redirects,
            location.pathname.replace(/order(2|s)\/[^\/]+/, ""),
            { order }
          )
          if (redirect !== null) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                `Redirecting from ${location.pathname} to ${
                  redirect.path
                } because '${redirect.reason}'`
              )
            }
            throw new RedirectException(redirect.path)
          }
        }

        return <Component {...props} />
      }
    },
    children: [
      {
        path: "respond",
        Component: RespondRoute,
        onTransition: confirmRouteExit,
        query: graphql`
          query routes_RespondQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Respond_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "offer",
        Component: OfferRoute,
        onTransition: confirmRouteExit,
        query: graphql`
          query routes_OfferQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Offer_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "shipping",
        Component: ShippingRoute,
        onTransition: confirmRouteExit,
        query: graphql`
          query routes_ShippingQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Shipping_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "payment",
        Component: PaymentRoute,
        onTransition: confirmRouteExit,
        query: graphql`
          query routes_PaymentQuery($orderID: ID!) {
            me {
              ...Payment_me
            }
            order: commerceOrder(id: $orderID) {
              ...Payment_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "payment/new",
        Component: NewPaymentRoute,
        onTransition: confirmRouteExit,
        query: graphql`
          query routes_NewPaymentQuery($orderID: ID!) {
            me {
              ...NewPayment_me
            }
            order: commerceOrder(id: $orderID) {
              ...NewPayment_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "review/counter",
        Component: CounterRoute,
        onTransition: confirmRouteExit,
        query: graphql`
          query routes_CounterQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Counter_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "review",
        Component: ReviewRoute,
        onTransition: confirmRouteExit,
        query: graphql`
          query routes_ReviewQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Review_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "review/accept",
        Component: AcceptRoute,
        query: graphql`
          query routes_AcceptQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Accept_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      {
        path: "review/decline",
        Component: RejectRoute,
        query: graphql`
          query routes_RejectQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Reject_order
            }
          }
        `,
      },
      {
        path: "status",
        Component: StatusRoute,
        query: graphql`
          query routes_StatusQuery($orderID: ID!) {
            order: commerceOrder(id: $orderID) {
              ...Status_order
            }
          }
        `,
        cacheConfig: {
          force: true,
        },
      },
      new Redirect({
        // For now, redirect the empty route to the shipping page
        from: "/",
        to: "/orders/:orderID/shipping",
      }) as any,
      {
        path: "*",
        Component: props => {
          return <ErrorPage code={404} />
        },
      },
    ],
  },
]
