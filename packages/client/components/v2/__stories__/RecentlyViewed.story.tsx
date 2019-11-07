import { Box } from "@artsy/palette"
import { SystemContextProvider } from "Artsy"
import { RecentlyViewedQueryRenderer } from "Components/v2"
import React from "react"
import { storiesOf } from "storybook/storiesOf"
import { Section } from "Utils/Section"

storiesOf("Styleguide/Components", module).add("Recently Viewed", () => {
  return (
    <React.Fragment>
      <Section title="Recently Viewed">
        <Box width="70%">
          <SystemContextProvider>
            <RecentlyViewedQueryRenderer />
          </SystemContextProvider>
        </Box>
      </Section>
    </React.Fragment>
  )
})
