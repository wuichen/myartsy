import { CSSGrid } from "@artsy/palette"
import { Serif } from "@artsy/palette"
import { CollectionsHubsHomepageNav_marketingHubCollections } from "__generated__/CollectionsHubsHomepageNav_marketingHubCollections.graphql"
import { AnalyticsSchema } from "Artsy/Analytics"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import track, { useTracking } from "react-tracking"
import Events from "Utils/Events"
import { resize } from "Utils/resizer"
import { ImageLink } from "./ImageLink"

interface CollectionsHubsHomepageNavProps {
  marketingHubCollections: CollectionsHubsHomepageNav_marketingHubCollections
}

export const CollectionsHubsHomepageNav = track(
  {
    context_page: AnalyticsSchema.PageName.HomePage,
    context_module: AnalyticsSchema.ContextModule.CollectionHubEntryPoint,
    subject: AnalyticsSchema.Subject.FeaturedCategories,
    action_type: AnalyticsSchema.ActionType.Impression,
  },
  { dispatch: data => Events.postEvent(data) }
)((props: CollectionsHubsHomepageNavProps) => {
  const { trackEvent } = useTracking()
  trackEvent({})
  return (
    <CSSGrid
      as="aside"
      gridTemplateColumns={[
        "repeat(2, 1fr)",
        "repeat(2, 1fr)",
        "repeat(3, 1fr)",
      ]}
      gridGap={20}
    >
      {props.marketingHubCollections.slice(0, 6).map(hub => (
        <ImageLink
          to={`/collection/${hub.slug}`}
          src={resize(hub.thumbnail, { width: 357, height: 175 })}
          ratio={[0.49]}
          title={<Serif size={["3", "4"]}>{hub.title}</Serif>}
          subtitle={<Serif size="2">{subtitleFor(hub.title)}</Serif>}
          key={hub.id}
          onClick={() => {
            trackEvent({
              action_type: AnalyticsSchema.ActionType.Click,
              type: AnalyticsSchema.Type.Thumbnail,
              desination_path: `/collection/${hub.slug}`,
            })
          }}
        />
      ))}
    </CSSGrid>
  )
})

export const CollectionsHubsHomepageNavFragmentContainer = createFragmentContainer(
  CollectionsHubsHomepageNav,
  {
    marketingHubCollections: graphql`
      fragment CollectionsHubsHomepageNav_marketingHubCollections on MarketingCollection
        @relay(plural: true) {
        id
        slug
        title
        thumbnail
      }
    `,
  }
)

/*
 * This is a customization just for the homepage entry-points use case.
 *
 * Valid hub collections will have a subtitle defined here, rather than in KAWS.
 * This mapping therefore will need to kept in sync as hubs are rotated
 * in/out of the entrypoint.
 *
 * TODO: remove (or replace with safer) placeholder once we have real data.
 */

const subtitlesMapping = {
  Contemporary: "Today’s leading artists and emerging talents",
  "Post-War": "From Abstract Expressionism to Pop Art",
  "Impressionist & Modern": "The birth of abstraction, Surrealism, and Dada",
  "Pre-20th Century": "Ancient Rome, the Renaissance, Baroque, and more",
  Photography: "Through the lens—from daguerreotypes to digital",
  "Street Art": "The rise of graffiti, vinyl toys, and skate culture",
}

const subtitleFor = (title: string) => {
  return subtitlesMapping[title]
}
