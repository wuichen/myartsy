import { RouteTab, TabCarousel } from "Components/v2"
import { MockRouter } from "DevTools/MockRouter"
import React from "react"
import { storiesOf } from "storybook/storiesOf"
import { Section } from "Utils/Section"

storiesOf("Styleguide/Components", module).add("Tabs (Router)", () => {
  const tabs = [
    <RouteTab to="/overview">Overview</RouteTab>,
    <RouteTab to="/cv">CV</RouteTab>,
    <RouteTab to="/shows">Shows</RouteTab>,
    <RouteTab to="/overview">Overview</RouteTab>,
    <RouteTab to="/cv">CV</RouteTab>,
    <RouteTab to="/shows">Shows</RouteTab>,
    <RouteTab to="/overview">Overview</RouteTab>,
    <RouteTab to="/cv">CV</RouteTab>,
    <RouteTab to="/shows">Shows</RouteTab>,
    <RouteTab to="/overview">Overview</RouteTab>,
    <RouteTab to="/cv">CV</RouteTab>,
    <RouteTab to="/shows">Shows</RouteTab>,
    <RouteTab to="/overview">Overview</RouteTab>,
    <RouteTab to="/cv">CV</RouteTab>,
    <RouteTab to="/shows">Shows</RouteTab>,
  ]
  return (
    <React.Fragment>
      <Section title="Route Tabs">
        <MockRouter
          initialRoute="/cv"
          routes={[
            {
              path: "/",
              Component: () => {
                return <TabCarousel tabs={tabs} />
              },
              children: [
                {
                  path: "/overview",
                },
                {
                  path: "/cv",
                },
                {
                  path: "/shows",
                },
              ],
            },
          ]}
        />
      </Section>
    </React.Fragment>
  )
})
