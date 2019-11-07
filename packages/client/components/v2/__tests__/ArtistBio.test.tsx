import React from "react"

import { ArtistBio_bio } from "__generated__/ArtistBio_bio.graphql"
import { MockBoot, renderRelayTree } from "DevTools"
import { graphql } from "react-relay"
import {
  ArtistBioFragmentContainer as ArtistBio,
  ArtistBioProps,
} from "../ArtistBio"

jest.unmock("react-relay")

describe("ArtistBio", () => {
  const biography_blurb = {
    text: '<a href="hi">hello how are you</a>',
    credit: "",
  }

  const getWrapper = (props: Partial<ArtistBioProps> = {}) => {
    return renderRelayTree({
      Component: ({ bio }: any) => (
        <MockBoot breakpoint="xl">
          <ArtistBio bio={bio} {...props} />
        </MockBoot>
      ),
      query: graphql`
        query ArtistBioTestQuery {
          bio: artist(id: "unused") {
            ...ArtistBio_bio
          }
        }
      `,
      mockResolvers: {
        Artist: (): Omit<ArtistBio_bio, " $refType"> => ({ biography_blurb }),
      },
    })
  }

  it("renders html text", async () => {
    const wrapper = await getWrapper()

    expect(wrapper.html()).toContain(biography_blurb.text)
  })
})
