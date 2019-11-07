import { Box, Serif } from "@artsy/palette"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { get } from "Utils/get"
import { ArtworkSidebarClassificationFragmentContainer as Classification } from "./ArtworkSidebarClassification"
import { ArtworkSidebarSizeInfoFragmentContainer as SizeInfo } from "./ArtworkSidebarSizeInfo"
import { ArtworkSidebarTitleInfoFragmentContainer as TitleInfo } from "./ArtworkSidebarTitleInfo"

import { ArtworkSidebarMetadata_artwork } from "__generated__/ArtworkSidebarMetadata_artwork.graphql"

export interface ArtworkSidebarMetadataProps {
  artwork: ArtworkSidebarMetadata_artwork
}

export class ArtworkSidebarMetadata extends React.Component<
  ArtworkSidebarMetadataProps
> {
  render() {
    const { artwork } = this.props
    const lotLabel = get(
      artwork,
      a => a.is_biddable && a.sale_artwork.lot_label
    )
    return (
      <Box>
        {lotLabel && (
          <Serif size="2" weight="semibold" color="black100">
            Lot {lotLabel}
          </Serif>
        )}
        <TitleInfo artwork={artwork} />
        {artwork.edition_sets.length < 2 && <SizeInfo piece={artwork} />}
        <Classification artwork={artwork} />
      </Box>
    )
  }
}

export const ArtworkSidebarMetadataFragmentContainer = createFragmentContainer(
  ArtworkSidebarMetadata,
  {
    artwork: graphql`
      fragment ArtworkSidebarMetadata_artwork on Artwork {
        is_biddable
        edition_sets {
          __typename
        }
        sale_artwork {
          lot_label
        }
        ...ArtworkSidebarTitleInfo_artwork
        ...ArtworkSidebarSizeInfo_piece
        ...ArtworkSidebarClassification_artwork
      }
    `,
  }
)
