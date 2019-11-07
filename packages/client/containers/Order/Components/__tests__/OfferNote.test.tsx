import { Link } from "@artsy/palette"
import { SystemContextProvider } from "Artsy"
import { mount, ReactWrapper } from "enzyme"
import React from "react"
import { ExtractProps } from "Utils/ExtractProps"
import { OfferNote } from "../OfferNote"

const simulateTyping = (wrapper: ReactWrapper, text: string) => {
  const textArea = wrapper.find("textarea")
  // @ts-ignore
  textArea.getDOMNode().value = text
  textArea.simulate("change")
}

describe("OfferNote", () => {
  const onChange = jest.fn()
  const mediator = { trigger: jest.fn() }

  const getWrapper = (props: Partial<ExtractProps<typeof OfferNote>> = {}) =>
    mount(
      <SystemContextProvider mediator={mediator}>
        <OfferNote onChange={onChange} artworkId="artwork-id" {...props} />
      </SystemContextProvider>
    )
  it("calls onChange with appropriate change events", () => {
    const wrapper = getWrapper()

    simulateTyping(wrapper, "hello world")

    expect(onChange).toHaveBeenCalledWith({
      value: "hello world",
      exceedsCharacterLimit: false,
    })

    const twoHundredAs = new Array(200).fill("a").join("")
    expect(twoHundredAs.length).toBe(200)
    simulateTyping(wrapper, twoHundredAs)

    expect(onChange).toHaveBeenCalledWith({
      value: twoHundredAs,
      exceedsCharacterLimit: false,
    })

    const twoHundredAndOneAs = new Array(201).fill("a").join("")
    simulateTyping(wrapper, twoHundredAndOneAs)

    expect(onChange).toHaveBeenCalledWith({
      value: twoHundredAndOneAs,
      exceedsCharacterLimit: true,
    })
  })

  it("has a title and description and a character limit", () => {
    const text = getWrapper().text()
    expect(text).toContain("Note (optional)")
    expect(text).toContain(
      "Use this note to add any additional context about your offer"
    )
    expect(text).toContain("0 / 200 max")
  })

  it("has a different description for counteroffers", () => {
    const text = getWrapper({ counteroffer: true }).text()
    expect(text).toContain(
      "Use this note to add any additional context about your counteroffer"
    )
  })

  it("has a link to ask a specialist things", () => {
    const wrapper = getWrapper()
    const link = wrapper.find(Link)
    expect(link.text()).toContain("ask our specialists")

    link.simulate("click")

    expect(mediator.trigger).toHaveBeenCalledWith(
      "openOrdersContactArtsyModal",
      {
        artworkId: "artwork-id",
      }
    )
  })
})
