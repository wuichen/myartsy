import { color, Flex, Link, Sans, Spacer } from "@artsy/palette"
import { SystemContextConsumer } from "Artsy"
import { track } from "Artsy/Analytics"
import * as Schema from "Artsy/Analytics/Schema"
import React, { Component } from "react"
import styled from "styled-components"

interface StickyFooterProps {
  artworkId: string | null
  orderType: string | null
}

@track()
export class StickyFooter extends Component<StickyFooterProps> {
  @track<StickyFooterProps>(props => ({
    action_type: Schema.ActionType.Click,
    subject: Schema.Subject.BNMOReadFAQ,
    type: "button",
    flow: props.orderType === "OFFER" ? "make offer" : "buy now",
  }))
  onClickReadFAQ() {
    window.open("https://www.artsy.net/buy-now-feature-faq", "_blank")
  }

  @track<StickyFooterProps>(props => ({
    action_type: Schema.ActionType.Click,
    subject: Schema.Subject.BNMOAskSpecialist,
    type: "button",
    flow: props.orderType === "OFFER" ? "make offer" : "buy now",
  }))
  onClickAskSpecialist(mediator) {
    mediator.trigger("openOrdersContactArtsyModal", {
      artworkId: this.props.artworkId,
    })
  }

  render() {
    return (
      <FooterContainer>
        <SystemContextConsumer>
          {({ mediator }) => (
            <>
              <Sans size="2" color="black60">
                Need help?{" "}
                <Link onClick={this.onClickReadFAQ.bind(this)}>
                  Read our FAQ
                </Link>{" "}
                or{" "}
                <Link onClick={this.onClickAskSpecialist.bind(this, mediator)}>
                  ask a question
                </Link>
                .
              </Sans>
              <Spacer mb={2} />
            </>
          )}
        </SystemContextConsumer>
      </FooterContainer>
    )
  }
}

const FooterContainer = styled(Flex)`
  height: calc(46px + env(safe-area-inset-bottom));
  background-color: ${color("white100")};
  bottom: 0;
  left: 0;
  position: fixed;
  width: 100%;
  border-top: 1px solid ${color("black10")};
  align-items: center;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom);
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
`
