import { Formik, FormikProps } from "formik"
import React, { Component } from "react"

import {
  Error,
  Footer,
  FormContainer as Form,
  SubmitButton,
} from "Components/Authentication/commonElements"
import QuickInput from "Components/QuickInput"
import { repcaptcha } from "Utils/repcaptcha"
import { FormProps, InputValues, ModalType } from "../Types"
import { ForgotPasswordValidator } from "../Validators"

export interface ForgotPasswordFormState {
  error?: string
}

export class ForgotPasswordForm extends Component<
  FormProps,
  ForgotPasswordFormState
> {
  state = {
    error: this.props.error,
  }

  onSubmit = (values: InputValues, formikBag: FormikProps<InputValues>) => {
    repcaptcha("forgot_submit")
    this.props.handleSubmit(values, formikBag)
  }

  render() {
    return (
      <Formik
        initialValues={this.props.values}
        onSubmit={this.onSubmit}
        validationSchema={ForgotPasswordValidator}
      >
        {({
          values,
          errors,
          touched,
          handleChange: formikHandleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          status,
          setStatus,
        }: FormikProps<InputValues>) => {
          const handleChange = e => {
            setStatus(null)
            this.setState({ error: null })
            formikHandleChange(e)
          }

          return (
            <Form onSubmit={handleSubmit} height={180}>
              <QuickInput
                block
                error={touched.email && errors.email}
                placeholder="Enter your email address"
                name="email"
                label="Email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus
              />
              {status && !status.success && <Error show>{status.error}</Error>}
              <SubmitButton disabled={isSubmitting}>
                Send Reset Instructions
              </SubmitButton>
              <Footer
                handleTypeChange={() =>
                  this.props.handleTypeChange(ModalType.login)
                }
                mode={"forgot" as ModalType}
              />
            </Form>
          )
        }}
      </Formik>
    )
  }
}
