import { color, Flex, Serif } from "@artsy/palette"
import Icon from "Components/Icon"
import React from "react"
import styled from "styled-components"

interface FollowIconProps {
  readonly isFollowed?: boolean | false
}

export const FollowIconContainer = styled(Flex)`
  align-items: center;
  color: ${color("black100")};
  cursor: pointer;
`

const Follow = styled(props => (
  <Serif size="2" {...props}>
    Follow
  </Serif>
))``

const Unfollow = styled(props => (
  <Serif size="2" {...props}>
    Unfollow
  </Serif>
))``

const Following = styled(props => (
  <Serif size="2" {...props}>
    Following
  </Serif>
))``

const FollowingHover = styled.div`
  ${Unfollow} {
    display: none;
  }

  &:hover {
    color: ${color("red100")};

    ${Following} {
      display: none;
    }

    ${Unfollow} {
      display: block;
    }
  }
`

const FollowHover = styled.div`
  &:hover {
    color: ${color("purple100")};
  }
`

export class FollowIcon extends React.Component<FollowIconProps> {
  render() {
    const { isFollowed } = this.props
    const iconName = isFollowed ? "follow-circle.is-following" : "follow-circle"

    return (
      <FollowIconContainer>
        <Icon
          name={iconName}
          style={{
            verticalAlign: "left",
            color: "inherit",
            margin: "0 0 0 -5px",
          }}
        />
        {isFollowed ? (
          <FollowingHover>
            <Following />
            <Unfollow />
          </FollowingHover>
        ) : (
          <FollowHover>
            <Follow />
          </FollowHover>
        )}
      </FollowIconContainer>
    )
  }
}

// Tests
Follow.displayName = "Follow"
Following.displayName = "Following"
Unfollow.displayName = "Unfollow"
