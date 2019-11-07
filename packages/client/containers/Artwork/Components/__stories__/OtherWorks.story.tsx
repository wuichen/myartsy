import { OtherWorksQuery } from "__generated__/OtherWorksQuery.graphql"
import { SystemContext } from "Artsy"
import { renderWithLoadProgress } from "Artsy/Relay/renderWithLoadProgress"
import { SystemQueryRenderer as QueryRenderer } from "Artsy/Relay/SystemQueryRenderer"
import React, { useContext } from "react"
import { graphql } from "react-relay"
import { storiesOf } from "storybook/storiesOf"
import { Section } from "Utils/Section"
import { OtherWorksFragmentContainer } from "../OtherWorks"
import { RelatedWorksArtworkGridQueryRenderer as RelatedWorksArtworkGrid } from "../OtherWorks/RelatedWorksArtworkGrid"

export const OtherWorks = ({ artworkSlug }: { artworkSlug: string }) => {
  const { relayEnvironment } = useContext(SystemContext)

  return (
    <QueryRenderer<OtherWorksQuery>
      environment={relayEnvironment}
      variables={{ artworkSlug }}
      query={graphql`
        query OtherWorksQuery($artworkSlug: String!) {
          artwork(id: $artworkSlug) {
            ...OtherWorks_artwork
          }
        }
      `}
      render={renderWithLoadProgress(OtherWorksFragmentContainer)}
    />
  )
}

storiesOf("Apps/Artwork/Components/OtherWorks", module)
  .add("Auctions", () => {
    return (
      <>
        <Section title="Open Auction">
          <OtherWorks artworkSlug="david-hockney-diptychon-3" />
        </Section>
        <Section title="Closed Auction">
          <OtherWorks artworkSlug="patrick-hughes-poppy-1" />
        </Section>
      </>
    )
  })
  .add("Artist", () => {
    return (
      <Section title="Artist">
        <OtherWorks artworkSlug="on-kawara-9-jan-1973" />
      </Section>
    )
  })
  .add("Fair", () => {
    return (
      <Section title="Fair">
        <OtherWorks artworkSlug="lucio-fontana-concetto-spaziale-attese-139" />
      </Section>
    )
  })
  .add("Partner Show (Gallery)", () => {
    return (
      <Section title="Gallery">
        <OtherWorks artworkSlug="david-hockney-early-morning-4" />
      </Section>
    )
  })
  .add("Related", () => {
    return (
      <Section title="Related">
        <RelatedWorksArtworkGrid artworkSlug="david-hockney-early-morning-4" />
      </Section>
    )
  })
