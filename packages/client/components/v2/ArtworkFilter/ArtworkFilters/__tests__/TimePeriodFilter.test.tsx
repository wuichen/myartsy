import { mount } from "enzyme"
import React from "react"
import {
  ArtworkFilterContextProvider,
  useArtworkFilterContext,
} from "../../ArtworkFilterContext"
import { TimePeriodFilter } from "../TimePeriodFilter"

describe("TimePeriodFilter", () => {
  let context

  const getWrapper = (props = {}) => {
    return mount(
      <ArtworkFilterContextProvider {...props}>
        <TimePeriodFilterFilterTest />
      </ArtworkFilterContextProvider>
    )
  }

  const TimePeriodFilterFilterTest = () => {
    context = useArtworkFilterContext()
    return <TimePeriodFilter expanded />
  }

  it("shows specific time periods if aggregations passed to context", () => {
    const wrapper = getWrapper({
      aggregations: [
        {
          slice: "MAJOR_PERIOD",
          counts: [
            {
              name: "Late 19th Century",
              id: "foo-period",
            },
          ],
        },
      ],
    })

    expect(wrapper.html()).toContain("Late 19th Century")
    expect(wrapper.html()).not.toContain("2010")
  })

  it("updates context on filter change", done => {
    const wrapper = getWrapper()
    wrapper
      .find("Radio")
      .first()
      .find("Flex")
      .first()
      .simulate("click")

    setTimeout(() => {
      expect(context.filters.major_periods).toEqual(["2010"])
      done()
    }, 0)
  })
})
