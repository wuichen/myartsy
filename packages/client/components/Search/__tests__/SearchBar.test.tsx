import Input from "Components/Input"
import {
  getSearchTerm,
  SearchBarRefetchContainer as SearchBar,
} from "Components/Search/SearchBar"
import { SuggestionItem } from "Components/Search/Suggestions/SuggestionItem"
import { renderRelayTree } from "DevTools"
import { MockBoot } from "DevTools/MockBoot"
import { ReactWrapper } from "enzyme"
import React from "react"
import { graphql } from "react-relay"
import { flushPromiseQueue } from "Utils/flushPromiseQueue"

jest.unmock("react-relay")

const searchResults = {
  search: {
    edges: [
      {
        node: {
          displayLabel: "Percy Z",
          href: "/cat/percy-z",
          displayType: "Cat",
          id: "percy-z",
        },
      },
    ],
  },

  filter_artworks: {
    artworks_connection: {
      edges: [],
    },
  },
}

const simulateTyping = (wrapper: ReactWrapper, text: string) => {
  const textArea = wrapper.find("input")
  textArea.simulate("focus")
  // @ts-ignore
  textArea.getDOMNode().value = text
  textArea.simulate("change")
}

const getWrapper = (viewer, breakpoint = "xl") => {
  return renderRelayTree({
    Component: SearchBar,
    query: graphql`
      query SearchBarTestQuery($term: String!, $hasTerm: Boolean!) {
        viewer {
          ...SearchBar_viewer @arguments(term: $term, hasTerm: $hasTerm)
        }
      }
    `,
    mockData: {
      viewer,
    },
    variables: {
      term: "perc",
      hasTerm: true,
    },
    wrapper: children => (
      <MockBoot breakpoint={breakpoint as any}>{children}</MockBoot>
    ),
  })
}

describe("SearchBar", () => {
  it("displays search results", async () => {
    const component = await getWrapper(searchResults)

    simulateTyping(component, "blah") // Any text of non-zero length.
    await flushPromiseQueue()

    expect(component.text()).toContain("Percy Z")
    expect(component.text()).toContain("Cat")
  })

  it("displays long placeholder text at sizes greater than xs", async () => {
    const component = await getWrapper(searchResults)
    await flushPromiseQueue()
    expect(component.find(Input).props().placeholder).toBe(
      "Search by artist, gallery, style, theme, tag, etc."
    )
  })

  it("displays short placeholder text in the xs breakpoint", async () => {
    const component = await getWrapper(searchResults, "xs")
    await flushPromiseQueue()

    expect(component.find(Input).props().placeholder).toBe("Search Artsy")
  })

  it("navigates the user when clicking on an item", async () => {
    const component = await getWrapper(searchResults)

    simulateTyping(component, "blah") // Any text of non-zero length.
    await flushPromiseQueue()

    window.location.assign = jest.fn()
    component
      .find(SuggestionItem)
      .at(0)
      .simulate("click")

    expect(window.location.assign).toHaveBeenCalledWith("/cat/percy-z")
  })

  it("highlights matching parts of suggestions", async () => {
    const component = await getWrapper(searchResults)

    simulateTyping(component, "perc") // Matching text w/ suggestion.
    await flushPromiseQueue()

    expect(component.html()).toContain("<strong>Perc</strong>y Z")
  })
})

describe("getSearchTerm", () => {
  function buildLocationWithQueryString(queryString: string): Location {
    return {
      ancestorOrigins: undefined,
      host: undefined,
      hostname: undefined,
      href: undefined,
      origin: undefined,
      port: undefined,
      protocol: undefined,
      assign: undefined,
      hash: undefined,
      pathname: undefined,
      reload: undefined,
      replace: undefined,
      search: queryString,
    }
  }

  it("returns empty string if there is no term", () => {
    const location = buildLocationWithQueryString(undefined)

    const result = getSearchTerm(location)

    expect(result).toEqual("")
  })

  it("returns empty string if there is an empty term", () => {
    const location = buildLocationWithQueryString("")

    const result = getSearchTerm(location)

    expect(result).toEqual("")
  })

  it("returns the term if there is a single one", () => {
    const location = buildLocationWithQueryString("?term=monkey")

    const result = getSearchTerm(location)

    expect(result).toEqual("monkey")
  })

  it("returns the first term if there are multiple", () => {
    // This is not really a concern in real-life, but TypeScript says
    //  it can happen, so we should cover it.
    const location = buildLocationWithQueryString("?term=monkey&term=elephant")

    const result = getSearchTerm(location)

    expect(result).toEqual("monkey")
  })
})
