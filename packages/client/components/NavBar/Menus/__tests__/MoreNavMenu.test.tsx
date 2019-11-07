import { mount } from "enzyme"
import React from "react"
import { MoreNavMenu } from "../MoreNavMenu"

jest.mock("Artsy/Analytics/useTracking", () => ({
  useTracking: () => ({
    trackEvent: x => x,
  }),
}))

describe("MoreNavMenu", () => {
  const getWrapper = () => {
    return mount(<MoreNavMenu />)
  }

  const defaultLinks = [
    ["/galleries", "Galleries"],
    ["/fairs", "Fairs"],
    ["/artists", "Artists"],
    ["/shows", "Shows"],
    ["/institutions", "Museums"],
    ["https://partners.artsy.net", "Artsy for Galleries"],
  ]

  describe("nav structure", () => {
    it("renders the correct items", () => {
      const wrapper = getWrapper()
      const links = wrapper.find("MenuItem")

      defaultLinks.forEach(([href, linkLabel], index) => {
        const navLink = links.at(index)
        expect(href).toEqual(navLink.prop("href"))
        expect(linkLabel).toEqual(navLink.text())
      })
    })
  })
})
