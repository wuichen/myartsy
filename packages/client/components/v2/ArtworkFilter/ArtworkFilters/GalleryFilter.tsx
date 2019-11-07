import { Flex, Radio, RadioGroup, Toggle } from "@artsy/palette"
import { sortBy } from "lodash"
import React, { FC } from "react"
import { useArtworkFilterContext } from "../ArtworkFilterContext"

export const GalleryFilter: FC = () => {
  const { aggregations, ...filterContext } = useArtworkFilterContext()
  const items = aggregations.find(agg => agg.slice === "GALLERY")

  if (!(items && items.counts)) {
    return null
  }

  const selectedGallery = filterContext.filters.partner_id

  return (
    <Toggle label="Gallery">
      <Flex flexDirection="column" alignItems="left" my={1}>
        <RadioGroup
          deselectable
          defaultValue={selectedGallery}
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
