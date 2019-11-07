import { Flex, Radio, RadioGroup, Toggle } from "@artsy/palette"
import { sortBy } from "lodash"
import React, { FC } from "react"
import { useArtworkFilterContext } from "../ArtworkFilterContext"

export const InstitutionFilter: FC = () => {
  const { aggregations, ...filterContext } = useArtworkFilterContext()
  const items = aggregations.find(agg => agg.slice === "INSTITUTION")

  if (!(items && items.counts)) {
    return null
  }

  const selectedItem = filterContext.filters.partner_id

  return (
    <Toggle label="Institution">
      <Flex flexDirection="column" alignItems="left" my={1}>
        <RadioGroup
          deselectable
          defaultValue={selectedItem}
          onSelect={selectedOption => {
            filterContext.setFilter("partner_id", selectedOption)
          }}
        >
          {sortBy(items.counts, ["name"]).map((item, index) => {
            return (
              <Radio
                key={index}
                my={0.3}
                value={item.id.toLocaleLowerCase()}
                label={item.name}
              />
            )
          })}
        </RadioGroup>
      </Flex>
    </Toggle>
  )
}
