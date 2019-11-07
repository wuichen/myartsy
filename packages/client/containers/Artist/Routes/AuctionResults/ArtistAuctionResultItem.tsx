import { Col, Row } from "@artsy/palette"
import { ArtistAuctionResultItem_auctionResult } from "__generated__/ArtistAuctionResultItem_auctionResult.graphql"
import { SystemContextProps } from "Artsy"
import { Mediator, SystemContext } from "Artsy"
import React, { SFC, useContext } from "react"
import { createFragmentContainer, graphql } from "react-relay"
import styled from "styled-components"
import { Subscribe } from "unstated"
import { Media } from "Utils/Responsive"
import { AuctionResultsState } from "./state"

import {
  Box,
  Button,
  Flex,
  Image,
  Separator,
  Serif,
  Spacer,
} from "@artsy/palette"
import { get } from "Utils/get"

export interface Props extends SystemContextProps {
  auctionResult: ArtistAuctionResultItem_auctionResult
  mediator?: Mediator
  lastChild: boolean
}

// TODO: This whole component should be refactored to use less `Media` decisions
export const ArtistAuctionResultItem: SFC<Props> = props => {
  const { user, mediator } = useContext(SystemContext)
  return (
    <>
      <Media at="xs">
        {(className, renderChildren) => (
          <Row className={className}>
            {renderChildren && (
              <ExtraSmallAuctionItem
                {...props}
                mediator={mediator}
                user={user}
              />
            )}
          </Row>
        )}
      </Media>
      <Media between={["sm", "lg"]}>
        {(className, renderChildren) => (
          <Row className={className}>
            {renderChildren && (
              <SmallAuctionItem {...props} mediator={mediator} user={user} />
            )}
          </Row>
        )}
      </Media>
      <Media greaterThanOrEqual="lg">
        {(className, renderChildren) => (
          <Row className={className}>
            {renderChildren && (
              <LargeAuctionItem {...props} mediator={mediator} user={user} />
            )}
          </Row>
        )}
      </Media>
      <Col>
        <Box pt={2} pb={1}>
          {!props.lastChild && <Separator />}
        </Box>
      </Col>
    </>
  )
}

const LargeAuctionItem: SFC<Props> = props => {
  const {
    auctionResult: {
      dimension_text,
      images,
      date_text,
      organization,
      sale_date_text,
      title,
    },
    salePrice,
    truncatedDescription,
    estimatedPrice,
  } = getProps(props)

  const imageUrl = get(images, i => i.thumbnail.url, "")
  return (
    <Subscribe to={[AuctionResultsState]}>
      {({ state, showDetailsModal }: AuctionResultsState) => {
        return (
          <>
            <Col sm={1}>
              <Box height="auto" pr={2}>
                <Image width="70px" src={imageUrl} />
              </Box>
            </Col>
            <Col sm={4}>
              <Box pl={1} pr={6}>
                <Serif size="2" italic>
                  {title && title + ","}
                  {date_text}
                </Serif>
                <Serif size="2">{dimension_text}</Serif>
                <Spacer pt={1} />
                <Serif size="1" color="black60">
                  {truncatedDescription}
                </Serif>
              </Box>
            </Col>
            <Col sm={3}>
              <Box pr={2}>
                <Serif size="2">{organization}</Serif>
                <Serif size="2" color="black60">
                  {sale_date_text}
                </Serif>
                <Serif size="2" color="black60">
                  <FullDescriptionLink onClick={() => showDetailsModal(props)}>
                    Full description
                  </FullDescriptionLink>
                </Serif>
              </Box>
            </Col>
            <Col sm={4}>
              {renderPricing(
                salePrice,
                estimatedPrice,
                props.user,
                props.mediator,
                "lg"
              )}
            </Col>
          </>
        )
      }}
    </Subscribe>
  )
}

const SmallAuctionItem: SFC<Props> = props => {
  const {
    auctionResult: { dimension_text, images, date_text, title },
    salePrice,
    truncatedDescription,
    estimatedPrice,
  } = getProps(props)
  const imageUrl = get(images, i => i.thumbnail.url, "")

  return (
    <>
      <Col sm={6}>
        <Flex>
          <Box height="auto">
            <Image width="70px" src={imageUrl} />
          </Box>

          <Spacer mr={2} />

          <Box pr={4}>
            <Serif size="2" italic>
              {title && title + ","}
              {date_text}
            </Serif>
            <Serif size="2">{dimension_text}</Serif>
            <Spacer pt={1} />
            <Serif size="1" color="black60">
              {truncatedDescription}
            </Serif>
          </Box>
        </Flex>
      </Col>
      <Col sm={6}>
        {renderPricing(
          salePrice,
          estimatedPrice,
          props.user,
          props.mediator,
          "sm"
        )}
      </Col>
    </>
  )
}

const ExtraSmallAuctionItem: SFC<Props> = props => {
  const {
    auctionResult: {
      dimension_text,
      images,
      date_text,
      organization,
      sale_date_text,
      title,
    },
    salePrice,
    estimatedPrice,
  } = getProps(props)
  const imageUrl = get(images, i => i.thumbnail.url, "")

  return (
    <>
      <Col>
        <Flex>
          <Box height="auto">
            <Image width="70px" src={imageUrl} />
          </Box>

          <Spacer mr={2} />

          <Box>
            <Serif size="2" italic>
              {title && title + ","}
              {date_text}
            </Serif>
            <Serif size="2">{dimension_text}</Serif>

            <Spacer pb={1} />

            <Serif size="2">{organization}</Serif>
            <Serif size="2" color="black60">
              {sale_date_text}
            </Serif>

            <Spacer pb={1} />
            {renderPricing(
              salePrice,
              estimatedPrice,
              props.user,
              props.mediator,
              "xs"
            )}
          </Box>
        </Flex>
      </Col>
    </>
  )
}

export const AuctionResultItemFragmentContainer = createFragmentContainer(
  ArtistAuctionResultItem,
  {
    auctionResult: graphql`
      fragment ArtistAuctionResultItem_auctionResult on AuctionResult {
        title
        dimension_text
        organization
        images {
          thumbnail {
            url
          }
        }
        description
        date_text
        sale_date_text
        price_realized {
          display
          cents_usd
        }
        estimate {
          display
        }
      }
    `,
  }
)

const FullDescriptionLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
`

FullDescriptionLink.displayName = "FullDescriptionLink"

// Helpers

const getSalePrice = price_realized => {
  const salePrice =
    price_realized.cents_usd === 0 ? null : price_realized.display
  return salePrice
}

const getDescription = (fullDescription: string) => {
  let truncatedDescription
  if (fullDescription) {
    truncatedDescription = fullDescription.substr(0, 200)
    return truncatedDescription + "..."
  }
  return truncatedDescription
}

const getProps = (props: Props) => {
  const {
    auctionResult: { description, estimate, price_realized },
  } = props

  const salePrice = getSalePrice(price_realized)
  const truncatedDescription = getDescription(description)
  const estimatedPrice = estimate.display

  return {
    ...props,
    salePrice,
    truncatedDescription,
    estimatedPrice,
  }
}

const renderPricing = (salePrice, estimatedPrice, user, mediator, size) => {
  if (user) {
    return (
      <>
        {salePrice && <Serif size="2">{`Sale: ${salePrice}`}</Serif>}
        {estimatedPrice && (
          <Serif size="2" color="black60">
            Est: {estimatedPrice}
          </Serif>
        )}
      </>
    )
  } else {
    const btnSize = size === "xs" || "sm" ? "small" : "large"
    return (
      <Button
        size={btnSize}
        variant="secondaryOutline"
        onClick={() => {
          mediator &&
            mediator.trigger("open:auth", {
              mode: "register",
              copy: "Sign up to see full auction records — for free",
            })
        }}
      >
        Sign up to see price
      </Button>
    )
  }
}
