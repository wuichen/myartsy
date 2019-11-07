import { Link } from "@artsy/palette"
import { ArtworkSidebarCurrentBidInfo_artwork } from "__generated__/ArtworkSidebarCurrentBidInfo_artwork.graphql"
import { SystemContextConsumer } from "Artsy"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { get } from "Utils/get"

import {
  Box,
  Flex,
  LosingBidIcon,
  Sans,
  Separator,
  Serif,
  Spacer,
  WinningBidIcon,
} from "@artsy/palette"

export interface ArtworkSidebarCurrentBidInfoProps {
  artwork: ArtworkSidebarCurrentBidInfo_artwork
}

export class ArtworkSidebarCurrentBidInfo extends React.Component<
  ArtworkSidebarCurrentBidInfoProps
> {
  onClickBuyerPremium(mediator) {
    const { artwork } = this.props
    mediator &&
      mediator.trigger &&
      mediator.trigger("openAuctionBuyerPremium", {
        auctionId: artwork.sale._id,
      })
  }

  render() {
    const { artwork } = this.props

    // We do not have reliable Bid info for artworks in Live sales in progress
    if (artwork.sale.is_live_open) return null

    if (artwork.sale.is_closed) {
      return (
        <Box>
          <Separator mb={3} />
          <Serif size="5t" weight="semibold" color="black100">
            Bidding closed
          </Serif>
          <Spacer mb={3} />
        </Box>
      )
    }

    // Don't display anything if there is no starting bid info
    if (!artwork.sale_artwork || !artwork.sale_artwork.current_bid) return null

    const bidsCount = get(artwork, a => a.sale_artwork.counts.bidder_positions)
    const bidsPresent = bidsCount > 0
    const bidColor =
      artwork.sale_artwork.is_with_reserve &&
      bidsPresent &&
      artwork.sale_artwork.reserve_status === "reserve_not_met"
        ? "red100"
        : "black60"

    const bidTextParts = []
    let reserveMessage = artwork.sale_artwork.reserve_message
    if (bidsPresent) {
      bidTextParts.push(bidsCount === 1 ? "1 bid" : bidsCount + " bids")
      if (reserveMessage) reserveMessage = reserveMessage.toLocaleLowerCase()
    }
    if (reserveMessage) {
      reserveMessage = reserveMessage + "."
      bidTextParts.push(reserveMessage)
    }
    const bidText = bidTextParts.join(", ")

    /**
     * NOTE: This is making an incorrect assumption that there could only ever
     *       be 1 live sale with this work. When we run into that case, there is
     *       likely design work to be done too, so we can adjust this then.
     */
    const myLotStanding = artwork.myLotStanding && artwork.myLotStanding[0]
    const myBidPresent = !!(myLotStanding && myLotStanding.most_recent_bid)
    const myMostRecent = myBidPresent && myLotStanding.most_recent_bid
    const myBidWinning =
      myBidPresent && get(myLotStanding, s => s.active_bid.is_winning)
    const myMaxBid = get(myMostRecent, bid => bid.max_bid.display)
    return (
      <SystemContextConsumer>
        {({ mediator }) => (
          <Box>
            <Separator mb={3} />
            <Flex
              width="100%"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Serif size="5t" weight="semibold" pr={1}>
                {bidsPresent ? "Current bid" : "Starting bid"}
              </Serif>
              <Flex
                flexDirection="row"
                justifyContent="right"
                alignContent="baseline"
              >
                {myBidPresent && (
                  <Box pt={0.5}>
                    {myBidWinning ? (
                      <WinningBidIcon fill="green100" />
                    ) : (
                      <LosingBidIcon fill="red100" />
                    )}
                  </Box>
                )}
                <Serif size="5t" weight="semibold" pl={0.5}>
                  {artwork.sale_artwork.current_bid.display}
                </Serif>
              </Flex>
            </Flex>
            <Flex
              width="100%"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Sans size="2" color={bidColor} pr={1}>
                {bidText}
              </Sans>
              {myMaxBid && (
                <Sans size="2" color="black60" pl={1}>
                  Your max: {myMaxBid}
                </Sans>
              )}
            </Flex>
            {artwork.sale && artwork.sale.is_with_buyers_premium && (
              <Serif size="2" color="black60">
                <br />
                This auction has a{" "}
                <Link onClick={this.onClickBuyerPremium.bind(this, mediator)}>
                  buyer's premium
                </Link>
                .<br />
                Shipping, taxes, and additional fees may apply.
              </Serif>
            )}
            <Spacer mb={3} />
          </Box>
        )}
      </SystemContextConsumer>
    )
  }
}

export const ArtworkSidebarCurrentBidInfoFragmentContainer = createFragmentContainer(
  ArtworkSidebarCurrentBidInfo,
  {
    artwork: graphql`
      fragment ArtworkSidebarCurrentBidInfo_artwork on Artwork {
        sale {
          is_closed
          is_live_open
          _id
          is_with_buyers_premium
        }
        sale_artwork {
          is_with_reserve
          reserve_message
          reserve_status
          current_bid {
            display
          }
          counts {
            bidder_positions
          }
        }
        myLotStanding(live: true) {
          active_bid {
            is_winning
          }
          most_recent_bid {
            max_bid {
              display
            }
          }
        }
      }
    `,
  }
)
