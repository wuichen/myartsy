import { SystemContextProvider } from "Artsy"
import { TextFeatureArticle } from "Components/Publishing/Fixtures/Articles"
import { TextFromArticle } from "Components/Publishing/Fixtures/Helpers"
import { wrapperWithContext } from "Components/Publishing/Fixtures/Helpers"
import { LinkWithTooltip } from "Components/Publishing/ToolTip/LinkWithTooltip"
import { mount } from "enzyme"
import "jest-styled-components"
import PropTypes from "prop-types"
import React from "react"
import { Text } from "../Text"

describe("Text", () => {
  const getWrapper = props => {
    return wrapperWithContext(
      {
        tooltipsData: {
          artists: [props.artist],
        },
      },
      {
        tooltipsData: PropTypes.object,
      },
      <SystemContextProvider>
        <Text {...props} />
      </SystemContextProvider>
    )
  }

  let testProps
  beforeEach(() => {
    testProps = {}
  })

  // FIXME: Reenable when React 16.4.5 is release
  // https://github.com/facebook/react/issues/13150#issuecomment-411134477

  // describe("Snapshots", () => {
  //   it("renders classic text properly", () => {
  //     testProps.html = TextFromArticle(TextClassicArticle)
  //     testProps.layout = "classic"

  //     const text = renderer.create(getWrapper(testProps)).toJSON()
  //     expect(text).toMatchSnapshot()
  //   })

  //   it("renders feature text properly", () => {
  //     testProps.html = TextFromArticle(TextFeatureArticle)
  //     testProps.layout = "feature"
  //     const text = renderer.create(getWrapper(testProps)).toJSON()
  //     expect(text).toMatchSnapshot()
  //   })

  //   it("renders standard text properly", () => {
  //     testProps.html = TextFromArticle(TextStandardArticle)
  //     testProps.layout = "standard"
  //     const text = renderer.create(getWrapper(testProps)).toJSON()
  //     expect(text).toMatchSnapshot()
  //   })

  //   it("renders news text properly", () => {
  //     testProps.html = TextFromArticle(NewsArticle)
  //     testProps.layout = "news"
  //     const text = renderer.create(getWrapper(testProps)).toJSON()
  //     expect(text).toMatchSnapshot()
  //   })
  // })

  describe("Unit", () => {
    it("Inserts content-end spans if isContentEnd", () => {
      testProps.html = TextFromArticle(TextFeatureArticle)
      testProps.layout = "feature"
      testProps.isContentEnd = true
      const wrapper = mount(getWrapper(testProps))

      expect(wrapper.html()).toMatch("content-end")
    })

    it("Inserts content-end spans in last paragraph, even if another block follows", () => {
      testProps.html = "<p>The end of the article</p><h3>An h3 after</h3>"
      testProps.layout = "standard"
      testProps.isContentEnd = true
      const wrapper = mount(getWrapper(testProps))

      expect(wrapper.html()).toMatch(
        `<p>The end of the article<span class=\"content-end\"> </span></p><h3>An h3 after</h3>`
      )
    })

    it("Removes content-end spans if not isContentEnd", () => {
      testProps.html =
        "<p>The end of a great article. <span class='content-end> </span></p>"
      testProps.layout = "feature"
      const wrapper = mount(getWrapper(testProps))

      expect(wrapper.html()).not.toMatch("content-end")
    })

    it("Should add LinkWithTooltip when artsy link is contained", () => {
      testProps.html = `<p>Amazing content <a href="https://www.artsy.net/artist/banksy">Banksy</a></p>`
      testProps.layout = "standard"
      testProps.showTooltips = true
      const wrapper = mount(getWrapper(testProps))

      expect(wrapper.find(LinkWithTooltip)).toHaveLength(1)
    })

    it("Does not render for empty links", () => {
      testProps.html = `<p>Amazing content <a href="https://www.artsy.net/artist/banksy"></a></p>`
      testProps.layout = "standard"
      testProps.showTooltips = true
      const wrapper = mount(getWrapper(testProps))

      expect(wrapper.find(LinkWithTooltip)).toHaveLength(0)
    })

    it("Creates a wrapper around links with 's text nodes, preventing line breaks", () => {
      testProps.html = `<p>Amazing content <a href="https://www.artsy.net/artist/banksy">Banksy</a>'s other amazing content <a href="https://www.artsy.net/artist/pablo-picasso">Picasso</a>'s other amazing...</p>`
      testProps.layout = "standard"
      testProps.showTooltips = true
      const wrapper = mount(getWrapper(testProps))

      expect(wrapper.find(".preventLineBreak").length).toEqual(2)
      expect(wrapper.html()).toContain("'s</span>")
    })
  })
})
