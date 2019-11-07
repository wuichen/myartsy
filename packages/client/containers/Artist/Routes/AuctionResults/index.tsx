import { AuctionResults_artist } from "__generated__/AuctionResults_artist.graphql"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { ArtistAuctionResultsRefetchContainer as AuctionResults } from "./ArtistAuctionResults"

export interface AuctionResultsRouteProps {
  artist: AuctionResults_artist
}

export const AuctionResultsRoute = (props: AuctionResultsRouteProps) => {
  return <AuctionResults sort="DATE_DESC" artist={props.artist} />
}

export const AuctionResultsRouteFragmentContainer = createFragmentContainer(
  AuctionResultsRoute,
  {
    artist: graphql`
      fragment AuctionResults_artist on Artist {
        ...ArtistAuctionResults_artist
      }
    `,
  }
)
