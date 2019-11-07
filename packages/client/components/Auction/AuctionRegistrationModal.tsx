import React, { useEffect, useState } from "react"

import { Box, Button, Flex, Modal, Sans, Serif } from "@artsy/palette"
import { ConditionsOfSaleCheckbox } from "./ConditionsOfSaleCheckbox"

// For convenience even though sale is for now a single value
interface Sale {
  name: string
}

export type SubmitRegistrationHandler = (opts: {
  setSubmitting: (isSubmitting: boolean) => void
  setError: (message: string) => void
  auction: Sale
  acceptedTerms: boolean
}) => void

interface Props {
  /** The auction attributes */
  auction: Sale
  /** Any cleanup that needs to happen when the modal closes */
  onClose: () => void
  /** Handle a successful submission (commence registration) */
  onSubmit: SubmitRegistrationHandler
}

export const AuctionRegistrationModal: React.FC<Props> = ({
  auction,
  onClose,
  onSubmit,
}) => {
  const [show, setShow] = useState(true)
  const [acceptedConditions, setAcceptedConditions] = useState(false)
  const [error, setError] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  function closeModal() {
    setShow(false)
  }

  useEffect(() => {
    if (!show) {
      onClose()
    }
  }, [show])

  function validate() {
    if (acceptedConditions) {
      setError("")
      return true
    } else {
      setError("You must agree to our terms.")
      return false
    }
  }

  function handleSubmit(acceptedTerms: boolean) {
    setSubmitting(true)
    onSubmit({ setSubmitting, setError, auction, acceptedTerms })
  }

  function validateAndSubmit() {
    if (validate()) {
      handleSubmit(true)
    }
  }

  return (
    <Modal show={show} onClose={closeModal}>
      <Box pt={[3, 0]} textAlign="center">
        <Serif size="6">Register for {auction.name}</Serif>
        <Serif my={3} size="4">
          Welcome back. To complete your registration, please confirm that you
          agree to the Conditions of Sale.
        </Serif>
        <Flex my={4} flexDirection="column" justifyContent="center">
          <Box mx="auto">
            <ConditionsOfSaleCheckbox
              selected={acceptedConditions}
              onSelect={value => setAcceptedConditions(value)}
            />
          </Box>
          {error && (
            <Sans mt={1} color="red100" size="2">
              {error}
            </Sans>
          )}
        </Flex>
        <Button
          block
          loading={submitting}
          width="100%"
          onClick={validateAndSubmit}
        >
          Register
        </Button>
      </Box>
    </Modal>
  )
}
