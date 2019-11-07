import { color, Flex, Sans } from "@artsy/palette"
import { ModalWidth, ModalWrapper } from "Components/Modal/ModalWrapper"
import React from "react"
import styled from "styled-components"

export interface CtaProps {
  action(): void
  text: React.ReactNode
}

export interface ModalDialogProps {
  show?: boolean
  heading: React.ReactNode
  detail?: React.ReactNode
  primaryCta: CtaProps
  secondaryCta?: CtaProps
  onClose?: () => void
}

export class ModalDialog extends React.Component<ModalDialogProps> {
  render() {
    const {
      show,
      heading,
      detail,
      onClose,
      primaryCta,
      secondaryCta,
    } = this.props

    return (
      <ModalWrapper
        show={show}
        onClose={onClose || (() => undefined)}
        width={ModalWidth.Narrow}
      >
        <Flex flexDirection="column" pt={2} px={2}>
          <Sans size="4" weight="medium" mb={10}>
            {heading}
          </Sans>
          {detail && (
            <Sans size="3" color="black60">
              {detail}
            </Sans>
          )}
        </Flex>

        <Flex mt={1} justifyContent="flex-end">
          {secondaryCta && (
            <ModalButton secondary onClick={secondaryCta.action}>
              {secondaryCta.text}
            </ModalButton>
          )}
          <ModalButton onClick={primaryCta.action}>
            {primaryCta.text}
          </ModalButton>
        </Flex>
      </ModalWrapper>
    )
  }
}

const StyledSans = styled(Sans)`
  transition: color 0.14s ease;
  cursor: pointer;
  color: ${color("purple100")};
`

// TODO: Generalize this button and move it to @artsy/palette
export const ModalButton: React.SFC<{
  secondary?: boolean
  onClick: () => void
}> = props => <StyledSans p={2} size="3" weight="medium" {...props} />
