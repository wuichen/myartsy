import { Serif } from "@artsy/palette"
import { ArtistBio_bio } from "__generated__/ArtistBio_bio.graphql"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import styled from "styled-components"

export interface ArtistBioProps {
  bio: ArtistBio_bio
  onReadMoreClicked?: () => void
  maxChars?: number
}

export class ArtistBio extends React.Component<ArtistBioProps> {
  render() {
    const { bio } = this.props
    return (
      <Serif size="3">
        <BioSpan
          dangerouslySetInnerHTML={{
            __html: bio.biography_blurb.text,
          }}
        />
      </Serif>
    )
  }
}

export const ArtistBioFragmentContainer = createFragmentContainer(ArtistBio, {
  bio: graphql`
    fragment ArtistBio_bio on Artist {
      biography_blurb(format: HTML, partner_bio: true) {
        text
      }
    }
  `,
})

/*
  Using dangerouslySetInnerHTML in our span adds an inline <p>.
  Here we make sure the inline <p> is formatted properly.
*/
const BioSpan = styled.span`
  > * {
    margin-block-start: 0;
    margin-block-end: 0;
    padding-bottom: 1em;
  }
  > *:last-child {
    display: inline;
  }
`
