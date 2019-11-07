import { SystemContextProvider } from "Artsy"
import * as authentication from "Components/NavBar/Utils/authentication"
import { mount } from "enzyme"
import React from "react"
import { UserMenu } from "../UserMenu"

jest.mock("Components/NavBar/Utils/authentication")
jest.mock("Artsy/Analytics/useTracking", () => {
  return {
    useTracking: () => ({
      trackEvent: jest.fn(),
    }),
  }
})

describe("UserMenu", () => {
  const mediator = {
    trigger: jest.fn(),
  }

  const getWrapper = (props = {}) => {
    return mount(
      <SystemContextProvider mediator={mediator} user={{}} {...props}>
        <UserMenu />
      </SystemContextProvider>
    )
  }

  // Label also includes SVG image title
  const defaultLinks = [
    ["/user/saves", "Save Saves & Follows"],
    ["/profile/edit", "user Collector Profile"],
    ["/user/edit", "settings Settings"],
  ]

  it("renders correct menu items", () => {
    const wrapper = getWrapper()
    const links = wrapper.find("MenuItem")

    defaultLinks.forEach(([href, linkLabel], index) => {
      const navLink = links.at(index)
      expect(href).toEqual(navLink.prop("href"))
      expect(linkLabel).toEqual(navLink.text())
    })

    expect(
      wrapper
        .find("MenuItem")
        .last()
        .text()
    ).toContain("Log out")
  })

  it("calls logout auth action on logout menu click", () => {
    const wrapper = getWrapper()
    wrapper
      .find("MenuItem")
      .last()
      .simulate("click")
    expect(authentication.logout).toHaveBeenCalledWith(mediator)
  })

  describe("admin features", () => {
    it("hides admin button if not admin", () => {
      const wrapper = getWrapper({ user: { type: "NotAdmin" } })
      expect(wrapper.html()).not.toContain("Admin")
    })

    it("shows admin button if admin", () => {
      const wrapper = getWrapper({ user: { type: "Admin" } })
      expect(wrapper.html()).toContain("Admin")
    })

    it("shows CMS button if admin", () => {
      const wrapper = getWrapper({ user: { type: "Admin" } })
      expect(wrapper.html()).toContain("CMS")
    })

    it("does not show CMS button if no partner access and not admin", () => {
      const wrapper = getWrapper({ user: { has_partner_access: false } })
      expect(wrapper.html()).not.toContain("CMS")
    })

    it("shows CMS button if has partner access and not admin", () => {
      const wrapper = getWrapper({ user: { has_partner_access: true } })
      expect(wrapper.html()).toContain("CMS")
    })
  })
})
