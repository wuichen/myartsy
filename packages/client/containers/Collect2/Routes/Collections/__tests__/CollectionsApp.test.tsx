import { EntityHeader } from "@artsy/palette"
import { CategoriesFixture } from "Apps/__tests__/Fixtures/Collections"
import { CollectionsAppFragmentContainer as CollectionsApp } from "Apps/Collect2/Routes/Collections"
import { CollectionsGrid } from "Apps/Collect2/Routes/Collections/Components/CollectionsGrid"
import { BreadCrumbList } from "Components/v2/Seo"
import { MockBoot, renderRelayTree } from "DevTools"
import React from "react"
import { graphql } from "react-relay"

jest.unmock("react-relay")
jest.mock("found", () => ({
  Link: () => <div />,
}))

describe("CollectionApp", () => {
  it("renders a relay tree correctly", async () => {
    const getRelayWrapper = async () => {
      return await renderRelayTree({
        Component: CollectionsApp,
        query: graphql`
          query CollectionsAppTestQuery {
            categories: marketingCategories {
              ...Collections_categories
            }
          }
        `,
        mockResolvers: {
          Query: () => ({
            marketingCategories: () => [
              {
                name: "Modern",
                collections: [], // "Modern" exists to test sort order so no need to add collections
              },
              ...CategoriesFixture,
            ],
          }),
        },
        wrapper: children => <MockBoot breakpoint="lg">{children}</MockBoot>,
      })
    }
    const tree = await getRelayWrapper()

    expect(tree.find(CollectionsGrid).length).toBe(4)
    expect(tree.find(EntityHeader).length).toBe(10)
    expect(tree.text()).toMatch("Abstract Art")
    expect(tree.text()).toMatch("Keith Haring: Pop")
    expect(tree.find(CollectionsGrid).get(0).props.name).toEqual("Abstract Art")
    expect(tree.find(CollectionsGrid).get(1).props.name).toEqual(
      "Contemporary Art"
    )
    expect(tree.find(CollectionsGrid).get(2).props.name).toEqual("Modern")
    expect(tree.find(CollectionsGrid).get(3).props.name).toEqual("Street Art")

    const breadCrumbList = tree.find(BreadCrumbList)

    expect(breadCrumbList.props().items).toEqual([
      { path: "/collections", name: "Collections" },
    ])
  })
})
