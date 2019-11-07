import React from "react"
import { storiesOf } from "storybook/storiesOf"
import { Section } from "Utils/Section"
import { StripeWrappedRegistrationForm } from "../RegistrationForm"

storiesOf("Apps/Auction/Components", module).add("RegistrationForm", () => {
  return (
    <Section>
      <StripeWrappedRegistrationForm
        onSubmit={(actions, result) => {
          window.alert(
            JSON.stringify(
              { telephone: result.phoneNumber, token: result.token.id },
              null,
              2
            )
          )
          actions.setSubmitting(false)
        }}
        trackSubmissionErrors={errors =>
          console.warn("Tracking errors: ", errors)
        }
      />
    </Section>
  )
})
