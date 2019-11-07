import { ArtworkGrid_artist } from "__generated__/ArtworkGrid_artist.graphql"
import { ArtworkGrid_artworks } from "__generated__/ArtworkGrid_artworks.graphql"
import { renderRelayTree } from "DevTools"
import { cloneDeep } from "lodash"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { ExtractProps } from "Utils/ExtractProps"
import { ArtworkGridItem } from "../../Artwork/GridItem"
import { ArtworkGridFixture } from "../__stories__/ArtworkGridFixture"
import ArtworkGrid, {
  ArtworkGridContainer,
  ArtworkGridContainerState,
  ArtworkGridProps,
  createSectionedArtworks,
} from "../ArtworkGrid"
import { ArtworkGridEmptyState } from "../ArtworkGridEmptyState"

jest.unmock("react-relay")
global.clearInterval = jest.fn()

const TestContainer = createFragmentContainer(
  ({
    artist,
    ...props
  }: ExtractProps<typeof ArtworkGrid> & { artist: ArtworkGrid_artist }) => {
    return <ArtworkGrid {...props} artworks={artist.artworks_connection} />
  },
  {
    artist: graphql`
      fragment ArtworkGrid_artist on Artist {
        artworks_connection(first: 4) {
          ...ArtworkGrid_artworks
        }
      }
    `,
  }
)

describe("ArtworkGrid", () => {
  describe("state", () => {
    describe("concerning column layout", () => {
      const aspectRatios = [
        1.23,
        0.74,
        0.75,
        1.06,
        0.73,
        1.28,
        0.77,
        1.37,
        1.37,
        0.75,
        0.74,
        0.73,
        0.78,
        0.71,
        0.75,
        1.34,
        1.2,
        0.71,
        1.27,
        0.73,
        0.75,
        0.8,
        0.8,
        1.36,
      ]

      const artworks = {
        " $refType": null,
        edges: aspectRatios.reduce(
          (acc, aspect_ratio) => [
            ...acc,
            { node: { image: { aspect_ratio } } },
          ],
          []
        ),
      } as ArtworkGrid_artworks

      function expected(columnsRatios: number[][]) {
        return columnsRatios.map(columnRatios =>
          columnRatios.map(aspect_ratio => ({ image: { aspect_ratio } }))
        )
      }

      it("tries to lay out artworks in columns such that they are similar in height, based on aspect ratio", () => {
        expect(createSectionedArtworks(artworks, 3)).toEqual(
          expected([
            [1.23, 1.06, 0.77, 0.74, 0.71, 1.2, 0.73, 0.8],
            [0.74, 1.28, 1.37, 0.75, 0.78, 1.34, 1.27, 0.75, 1.36],
            [0.75, 0.73, 1.37, 0.73, 0.75, 0.71, 0.8],
          ])
        )
        expect(createSectionedArtworks(artworks, 4)).toEqual(
          expected([
            [1.23, 0.73, 0.74, 0.75, 0.75],
            [0.74, 1.37, 0.75, 0.71, 0.73, 1.36],
            [0.75, 0.77, 0.78, 1.2, 1.27, 0.8],
            [1.06, 1.28, 1.37, 0.73, 1.34, 0.71, 0.8],
          ])
        )
      })
    })
  })

  describe("when rendering", () => {
    const getRelayWrapper = async ({
      artworks,
      ...componentProps
    }: ArtworkGridProps) => {
      return await renderRelayTree({
        Component: TestContainer,
        componentProps,
        query: graphql`
          query ArtworkGrid_Test_Query {
            artist(id: "pablo-picasso") {
              ...ArtworkGrid_artist
            }
          }
        `,
        mockData: {
          artist: { artworks_connection: artworks },
        },
      })
    }

    let props

    beforeEach(() => {
      props = {
        artworks: cloneDeep(ArtworkGridFixture),
      }
    })

    it("Renders artworks if present", async () => {
      const wrapper = await getRelayWrapper(props)
      expect(wrapper.text()).toMatch(ArtworkGridFixture.edges[0].node.title)
      expect(wrapper.find(ArtworkGridItem).length).toBe(4)
    })

    it("Renders empty message if no artworks", async () => {
      props.artworks.edges = []
      const wrapper = await getRelayWrapper(props)
      expect(wrapper.find(ArtworkGridEmptyState).exists()).toBeTruthy()
    })

    it("Can call onClearFilters from empty message", async () => {
      props.artworks.edges = []
      props.onClearFilters = jest.fn()
      const wrapper = await getRelayWrapper(props)
      wrapper.find("a").simulate("click")
      expect(props.onClearFilters).toBeCalled()
    })

    it("#componentDidMount sets state.interval if props.onLoadMore", async () => {
      props.onLoadMore = jest.fn()
      const wrapper = (await getRelayWrapper(props)).find(ArtworkGridContainer)
      const { interval } = wrapper.state() as ArtworkGridContainerState
      expect(interval).toBeGreaterThan(0)
    })

    it("#componentWillUnmount calls #clearInterval if state.interval exists", async () => {
      props.onLoadMore = jest.fn()
      const wrapper = (await getRelayWrapper(props)).find(ArtworkGridContainer)
      wrapper.instance().componentWillUnmount()
      expect(global.clearInterval).toBeCalled()
    })

    it("#maybeLoadMore calls props.onLoadMore if scroll position is at end", async () => {
      props.onLoadMore = jest.fn()
      const wrapper = (await getRelayWrapper(props))
        .find(ArtworkGridContainer)
        .instance() as ArtworkGridContainer
      wrapper.maybeLoadMore()
      expect(props.onLoadMore).toBeCalled()
    })

    it("#sectionedArtworks divides artworks into columns", async () => {
      const wrapper = (await getRelayWrapper(props))
        .find(ArtworkGridContainer)
        .instance() as ArtworkGridContainer
      const artworks = wrapper.sectionedArtworksForAllBreakpoints(
        props.artworks,
        [2, 2, 2, 3]
      )
      expect(artworks[0].length).toBe(2)
    })

    it("Renders artworks if present", async () => {
      const wrapper = (await getRelayWrapper(props)).find(ArtworkGridContainer)
      expect(wrapper.text()).toMatch(ArtworkGridFixture.edges[0].node.title)
      expect(wrapper.find(ArtworkGridItem).length).toBe(4)
    })
  })
})
