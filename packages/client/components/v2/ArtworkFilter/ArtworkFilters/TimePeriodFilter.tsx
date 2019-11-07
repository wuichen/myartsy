import { Flex, Radio, RadioGroup, Toggle } from "@artsy/palette"
import React, { FC } from "react"
import { get } from "Utils/get"
import { useArtworkFilterContext } from "../ArtworkFilterContext"

interface TimePeriodFilterProps {
  expanded?: boolean
}

export const TimePeriodFilter: FC<TimePeriodFilterProps> = ({
  expanded = false,
}) => {
  const { aggregations, ...filterContext } = useArtworkFilterContext()
  const timePeriods = aggregations.find(agg => agg.slice === "MAJOR_PERIOD")

  let periods
  if (timePeriods && timePeriods.counts) {
    periods = timePeriods.counts.filter(timePeriod => {
      return allowedPeriods.includes(timePeriod.name)
    })
  } else {
    periods = allowedPeriods.map(name => ({ name }))
  }

  const selectedPeriod = get(
    filterContext.filters,
    f => f.major_periods[0] || ""
  )

  return (
    <Toggle label="Time period" expanded={expanded}>
      <Flex flexDirection="column" my={1}>
        <RadioGroup
          deselectable
          defaultValue={selectedPeriod}
          onSelect={selectedOption => {
            filterContext.setFilter("major_periods", selectedOption)
          }}
        >
          {periods.map((timePeriod, index) => {
            return (
              <Radio
                my={0.3}
                value={timePeriod.name}
                key={index}
                label={timePeriod.name}
              />
            )
          })}
        </RadioGroup>
      </Flex>
    </Toggle>
  )
}

const allowedPeriods = [
  "2010",
  "2000",
  "1990",
  "1980",
  "1970",
  "1960",
  "1950",
  "1940",
  "1930",
  "1920",
  "1910",
  "1900",
  "Late 19th Century",
  "Mid 19th Century",
  "Early 19th Century",
]
