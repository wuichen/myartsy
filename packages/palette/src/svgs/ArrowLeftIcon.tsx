import React from "react"
import { color } from "../helpers"
import { Icon, IconProps, Path, Title } from "./Icon"

/** ArrowLeftIcon */
export const ArrowLeftIcon: React.SFC<IconProps> = props => {
  return (
    <Icon {...props} viewBox="0 0 18 18">
      <Title>navigate left</Title>
      <Path
        d="M12.06 15.94L5.12 9l6.94-6.94.88.88L6.88 9l6.06 6.06z"
        fill={color(props.fill)}
        fillRule="evenodd"
      />
    </Icon>
  )
}
