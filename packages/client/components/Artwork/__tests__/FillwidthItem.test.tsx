import { render } from "enzyme"
import React from "react"
import { FillwidthItem } from "../FillwidthItem"

describe("FillwidthItem", () => {
  // This scenario _should not_ happen. But it did. Every artwork should have
  //   an image, but somehow one snuck through in production and broke pages.
  describe("No image associated with an artwork", () => {
    it("Doesn't blow up when there is no image associated with an artwork", () => {
      const artwork = {
        " $fragmentRefs": null,
        href: "my/artwork",
      }

      const wrapper = render(<FillwidthItem artwork={artwork as any} />)

      expect(wrapper.html()).toBeNull()
    })
  })
})
