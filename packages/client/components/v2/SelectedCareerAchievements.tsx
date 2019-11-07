import { BorderBox, Box, Flex, Sans } from "@artsy/palette"
import { SelectedCareerAchievements_artist } from "__generated__/SelectedCareerAchievements_artist.graphql"
import {
  hasSections,
  highestCategory,
} from "Apps/Artist/Components/MarketInsights/MarketInsights"

import { ArtistInsight } from "Components/v2/ArtistInsight"
import { ArtistInsightsModal } from "Components/v2/ArtistInsightsModal"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"

export interface SelectedCareerAchievementsProps {
  artist: SelectedCareerAchievements_artist
  border?: boolean
  Container?: (props: { children: JSX.Element }) => JSX.Element
}

const CATEGORIES = {
  "blue-chip": "Blue chip",
  "top-established": "Established",
  "top-emerging": "Emerging",
}
const CATEGORY_LABEL_MAP = {
  "blue-chip": "Represented by internationally reputable galleries.",
  "top-established": "Represented by industry leading galleries.",
  "top-emerging": "Represented by up-and-coming galleries.",
}

export class SelectedCareerAchievements extends React.Component<
  SelectedCareerAchievementsProps
> {
  static defaultProps = {
    border: true,
  }

  state = {
    showModal: false,
  }

  renderAuctionHighlight() {
    if (
      !this.props.artist.auctionResults ||
      this.props.artist.auctionResults.edges.length < 1
    ) {
      return null
    }
    const topAuctionResult = this.props.artist.auctionResults.edges[0].node
    const display = `${topAuctionResult.price_realized.display}, ${
      topAuctionResult.organization
    }, ${topAuctionResult.sale_date}`

    return (
      <ArtistInsight
        key="HIGH_AUCTION"
        type="HIGH_AUCTION"
        label="High auction record"
        value={display}
      />
    )
  }
  renderGalleryRepresentation() {
    const { highlights } = this.props.artist
    const { partners } = highlights
    if (partners && partners.edges && partners.edges.length > 0) {
      const highCategory = highestCategory(partners.edges)
      const type = highCategory.toUpperCase().replace("-", "_")

      return (
        <ArtistInsight
          key={type}
          type={type}
          label={CATEGORIES[highCategory]}
          value={CATEGORY_LABEL_MAP[highCategory]}
        />
      )
    }
  }

  renderInsight(insight) {
    return (
      <ArtistInsight
        key={insight.type}
        type={insight.type}
        label={insight.label}
        entities={insight.entities}
      />
    )
  }

  render() {
    if (
      !hasSections(this.props.artist) &&
      (!this.props.artist.insights || this.props.artist.insights.length === 0)
    ) {
      return null
    }

    const Container = props => {
      let Wrap
      if (props.Container) {
        Wrap = this.props.Container
      } else if (this.props.border) {
        Wrap = BorderBox
      } else {
        Wrap = Box
      }

      return <Wrap {...props} />
    }

    return (
      <>
        <Container>
          <Flex flexDirection="column" alignItems="left" width="100%">
            <Sans size="2" weight="medium">
              Selected career achievements
            </Sans>
            <Flex
              flexDirection="row"
              flexWrap="wrap"
              justifyContent="space-between"
            >
              {this.renderGalleryRepresentation()}
              {this.renderAuctionHighlight()}

              {this.props.artist.insights.map(insight => {
                return this.renderInsight(insight)
              })}
            </Flex>
          </Flex>
        </Container>

        <ArtistInsightsModal />

        {this.props.children}
      </>
    )
  }
}

export const SelectedCareerAchievementsFragmentContainer = createFragmentContainer(
  SelectedCareerAchievements,
  {
    artist: graphql`
      fragment SelectedCareerAchievements_artist on Artist
        @argumentDefinitions(
          partner_category: {
            type: "[String]"
            defaultValue: ["blue-chip", "top-established", "top-emerging"]
          }
        ) {
        highlights {
          partners(
            first: 10
            display_on_partner_profile: true
            represented_by: true
            partner_category: $partner_category
          ) {
            edges {
              node {
                categories {
                  id
                }
              }
            }
          }
        }
        insights {
          type
          label
          entities
        }
        auctionResults(
          recordsTrusted: true
          first: 1
          sort: PRICE_AND_DATE_DESC
        ) {
          edges {
            node {
              price_realized {
                display(format: "0a")
              }
              organization
              sale_date(format: "YYYY")
            }
          }
        }
      }
    `,
  }
)
