import { Flex, Sans } from "@artsy/palette"
import { NavigationTabs_searchableConnection } from "__generated__/NavigationTabs_searchableConnection.graphql"
import { track } from "Artsy/Analytics"
import * as Schema from "Artsy/Analytics/Schema"
import { RouteTab, TabCarousel } from "Components/v2"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { get } from "Utils/get"

export interface Props {
  searchableConnection: NavigationTabs_searchableConnection
  term: string
  artworkCount: number
}

const MORE_TABS = ["tag", "city", "feature"]

const TAB_NAME_MAP = {
  artist: "Artists",
  marketing_collection: "Collections",
  PartnerGallery: "Galleries",
  partner_show: "Shows",
  fair: "Fairs",
  PartnerInstitution: "Institutions",
  PartnerInstitutionalSeller: "Institutions",
  gene: "Categories",
  article: "Articles",
  sale: "Auctions",
}

@track({
  context_module: Schema.ContextModule.NavigationTabs,
})
export class NavigationTabs extends React.Component<Props> {
  @track((_props, _state, [tab, destination_path]: string[]) => ({
    action_type: Schema.ActionType.Click,
    subject: tab,
    destination_path,
  }))
  trackClick(tab: string, destination_path: string) {
    // no-op
  }

  renderTab = (
    text: string,
    to: string,
    options: {
      exact?: boolean
      count?: number
    } = {}
  ) => {
    const { exact, count } = options
    const tabName = text.replace(/[0-9]/g, "").trim()
    return (
      <RouteTab
        to={to}
        exact={exact}
        onClick={() => {
          this.trackClick(tabName, to)
        }}
        key={to}
      >
        <Flex>
          {text}
          {count != null && (
            <Sans ml={0.5} size="3t" weight="regular">
              ({count})
            </Sans>
          )}
        </Flex>
      </RouteTab>
    )
  }

  tabs() {
    const { term, artworkCount } = this.props

    const route = tab => `/search${tab}?term=${term}`

    let restAggregationCount: number = 0
    MORE_TABS.forEach(
      key =>
        (restAggregationCount += get(
          aggregationFor(this.props, key),
          agg => agg.count,
          0
        ))
    )

    const tabs = []

    !!artworkCount &&
      tabs.push(
        this.renderTab("Artworks", route(""), {
          exact: true,
          count: artworkCount,
        })
      )

    Object.entries(tabCountMap(this.props)).map(
      ([key, value]: [string, number]) => {
        tabs.push(
          this.renderTab(key, route(`/${key.toLowerCase()}`), {
            count: value,
          })
        )
      }
    )

    !!restAggregationCount &&
      tabs.push(
        this.renderTab("More", route("/more"), {
          count: restAggregationCount,
        })
      )

    return tabs
  }

  render() {
    return (
      <Flex mx={[-2, 0]}>
        <TabCarousel tabs={this.tabs()} />
      </Flex>
    )
  }
}

export const NavigationTabsFragmentContainer = createFragmentContainer(
  NavigationTabs,
  {
    searchableConnection: graphql`
      fragment NavigationTabs_searchableConnection on SearchableConnection {
        aggregations {
          slice
          counts {
            count
            name
          }
        }
      }
    `,
  }
)

export interface TabCounts {
  Artists?: number
  Collections?: number
  Galleries?: number
  Shows?: number
  Fairs?: number
  Institutions?: number
  Categories?: number
  Articles?: number
  Auctions?: number
}

export const tabCountMap: (props: Props) => TabCounts = props => {
  return Object.entries(TAB_NAME_MAP).reduce((acc, [key, val]) => {
    let count = get(aggregationFor(props, key), agg => agg.count, 0)
    if (!count) {
      return acc
    }
    if (acc[val]) {
      count += acc[val]
    }
    return {
      ...acc,
      [val]: count,
    }
  }, {})
}

const aggregationFor = (props: Props, type: string) => {
  const { searchableConnection } = props
  const { aggregations } = searchableConnection

  const typeAggregation = aggregations.find(agg => agg.slice === "TYPE").counts

  return typeAggregation.find(agg => agg.name === type)
}
