import { Box, color, Flex, Link, Sans, Serif } from "@artsy/palette"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import React, { SFC } from "react"
import styled from "styled-components"

interface Props {
  display: string
  href: string
  isHighlighted: boolean
  label: string
  query: string
}

export const FirstSuggestionItem: SFC<Props> = props => {
  const { href, isHighlighted, query } = props
  const boxStyle = {
    borderBottom: `1px solid ${color("black10")}`,
  }

  return (
    <Box bg={isHighlighted ? "black5" : "white100"} style={boxStyle}>
      <Link color="black100" href={href} underlineBehavior="none">
        <SuggestionWrapper>
          <InnerWrapper
            flexDirection="column"
            flexGrow="1"
            justifyContent="center"
          >
            See full results for "{query}"
          </InnerWrapper>
        </SuggestionWrapper>
      </Link>
    </Box>
  )
}

export const SuggestionItem: SFC<Props> = props => {
  const { href, isHighlighted } = props

  return (
    <Box bg={isHighlighted ? "black5" : "white100"}>
      <Link color="black100" href={href} underlineBehavior="none">
        <SuggestionWrapper>
          <InnerWrapper
            flexDirection="column"
            flexGrow="1"
            justifyContent="center"
          >
            <DefaultSuggestion {...props} />
          </InnerWrapper>
        </SuggestionWrapper>
      </Link>
    </Box>
  )
}

const InnerWrapper = styled(Flex)`
  overflow: hidden;
  white-space: nowrap;
`

export const PLACEHOLDER = "Search by artist, gallery, style, theme, tag, etc."
export const PLACEHOLDER_XS = "Search Artsy"

const SuggestionWrapper = props => (
  <Flex alignItems="center" flexDirection="row" height="62px" pl={2}>
    {props.children}
  </Flex>
)

const DefaultSuggestion = ({ display, label, query }) => {
  const matches = match(display, query)
  const parts = parse(display, matches)
  const partTags = parts.map(({ highlight, text }, index) =>
    highlight ? <strong key={index}>{text}</strong> : text
  )

  return (
    <>
      <SuggestionTitle size="3">{partTags}</SuggestionTitle>
      <Sans color={color("black60")} size="2">
        {label}
      </Sans>
    </>
  )
}

const SuggestionTitle = styled(Serif)`
  overflow: hidden;
  text-overflow: ellipsis;
`
