import React, { useContext } from "react"
import { graphql } from "react-relay"

import { SystemContext } from "Artsy"
import { get } from "Utils/get"

import {
  LoadProgressRenderer,
  renderWithLoadProgress,
} from "Artsy/Relay/renderWithLoadProgress"

import {
  NotificationsMenuQuery,
  NotificationsMenuQueryResponse,
} from "__generated__/NotificationsMenuQuery.graphql"

import {
  Box,
  Flex,
  Image,
  Link,
  Menu,
  MenuItem,
  Sans,
  Separator,
  Serif,
} from "@artsy/palette"
import { SystemQueryRenderer as QueryRenderer } from "Artsy/Relay/SystemQueryRenderer"

export const NotificationMenuItems: React.FC<
  NotificationsMenuQueryResponse
> = props => {
  const notifications = get(
    props,
    p => {
      return p.me.followsAndSaves.notifications.edges
    },
    []
  )

  return (
    <>
      {notifications.map(({ node }, index) => {
        const { artists, href, image, summary } = node
        return (
          <MenuItem href={href} key={index}>
            <Flex alignItems="center">
              <Box width={40} height={40} bg="black5" mr={1}>
                <Image
                  src={image.resized.url}
                  width={40}
                  height={40}
                  style={{
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Box>
                <Sans size="2">{summary}</Sans>
                <Sans size="2" weight="medium">
                  {artists}
                </Sans>
              </Box>
            </Flex>
          </MenuItem>
        )
      })}

      <Flex py={1} flexDirection="column" alignItems="center">
        <>
          {notifications.length === 0 && (
            <Flex width="100%" flexDirection="column">
              <Box pt={1} pb={3} width="100%" textAlign="center">
                <Serif size="3">No new works</Serif>
              </Box>
            </Flex>
          )}

          <Box width="100%" px={2}>
            <Separator />
          </Box>

          <Box pt={2}>
            <Sans size="2">
              <Link href="/works-for-you">View all</Link>
            </Sans>
          </Box>
        </>
      </Flex>
    </>
  )
}

/**
 * The <Menu /> component renders a QueryRenderer inside of it, which fetches
 * individual MenuItems for display. During fetch there is a loading spinner.
 */
export const NotificationsMenu: React.FC = () => {
  return (
    <Menu title="Activity">
      <NotificationsQueryRenderer
        render={renderWithLoadProgress(
          NotificationMenuItems,
          {},
          {},
          { size: "small" }
        )}
      />
    </Menu>
  )
}

/**
 * This QueryRenderer is also shared with NotificationBadge. Once the request
 * is performed the data is cached at the network layer so menu data appears
 * immediately and doesn't require a second request.
 */
export const NotificationsQueryRenderer: React.FC<{
  render: LoadProgressRenderer<any>
}> = ({ render }) => {
  const { relayEnvironment } = useContext(SystemContext)

  return (
    <QueryRenderer<NotificationsMenuQuery>
      environment={relayEnvironment}
      query={graphql`
        query NotificationsMenuQuery {
          me {
            followsAndSaves {
              notifications: bundledArtworksByArtist(
                sort: PUBLISHED_AT_DESC
                first: 10
              ) @connection(key: "WorksForYou_notifications") {
                edges {
                  node {
                    href
                    summary
                    artists
                    published_at(format: "MMM DD")
                    image {
                      resized(height: 40, width: 40) {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `}
      variables={{}}
      render={render}
    />
  )
}
