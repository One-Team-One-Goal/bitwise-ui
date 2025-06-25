import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserRoleButton from '@/components/common/user-role-button'
import Stepper from '@/components/common/stepper'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'

// Dummy validation schemas and handlers for demonstration
const validationSchemas = [null, null, null, null]
const formValues = {
  userType: '',
  name: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
}

const SignupForm = () => {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  // Dummy handlers
  const handleVerifyCode = async () => {
    setVerificationSent(true)
    toast.success('Verification code sent! Please check your email.', {
      duration: 3000,
    })
    return Promise.resolve()
  }
  const handleSubmit = async () => {
    // ...your submit logic...
    toast.success('Account created! You can now log in.', { duration: 3000 })
    // navigate('/login') // if you want to redirect
  }

  const renderStepFields = (setFieldValue, values) => {
    switch (step) {
      case 1:
        return (
          <>
            <p className="text-3xl font-bold text-black-500 mb-2">
              Choose your role
            </p>
            <p className="text-sm text-black-500 mb-8">
              Are you a teacher or a student? Select the option that best
              describes you to personalize your experience.
            </p>
            <div className="flex justify-center items-center mb-4 space-x-12">
              <UserRoleButton
                type="button"
                onClick={() => {
                  setFieldValue('userType', 1)
                }}
                className={`bg-amber-50 text-black hover:bg-gray-600 btn-shadow-square addgrotesk ${
                  values.userType === 1 ? 'bg-bluez' : ''
                }`}
              >
                Student
              </UserRoleButton>
              <UserRoleButton
                type="button"
                onClick={() => {
                  setFieldValue('userType', 2)
                }}
                className={`bg-amber-50 text-black hover:bg-gray-600 btn-shadow-square addgrotesk ${
                  values.userType === 2 ? 'bg-bluez' : ''
                }`}
              >
                Teacher
              </UserRoleButton>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <p className="text-3xl font-bold text-black-500 mb-2">
              Let's start with your name & email
            </p>
            <p className="text-sm text-black-500 mb-8">
              This helps us personalize your experience. Don't worry, we won't
              share your info!
            </p>
            <label>Enter your name</label>
            <Input id="name" name="name" type="text" placeholder="John Doe" />
            <label>Enter your email</label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
            />
          </>
        )
      case 3:
        return (
          <>
            <p className="text-3xl font-bold text-black-500 mb-2">
              Almost there! Please enter your username & password
            </p>
            <p className="text-sm text-black-500 mb-8">
              This step helps secure your account. Rest assured, your
              information is safe with us!
            </p>
            <label>Enter your username</label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
            />
            <label>Enter your password</label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
            />
            <label>Confirm password</label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
            />
            {verificationSent && (
              <p className="text-green-600 text-sm mt-2">
                Verification code sent! Check your email.
              </p>
            )}
          </>
        )
      case 4:
        return (
          <>
            {showAlert && (
              <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-1/2 z-50 pt-10">
                <AlertDialog
                  variant="filled"
                  severity="success"
                  onClose={() => setShowAlert(false)}
                >
                  Verification code sent to your email. Please check your inbox.
                </AlertDialog>
              </div>
            )}
            <p className="text-3xl font-bold text-black-500 mb-2">
              Verify Your Email
            </p>
            <p className="text-sm text-black-500 mb-8">
              We've sent a 6-digit verification code to your email. Please enter
              it below to complete your registration.
            </p>
            <label>Enter verification code</label>
            <Input
              id="verificationCode"
              name="verificationCode"
              type="text"
              placeholder="XXXX-XXXX"
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      <div className="relative z-10 w-1/2 flex flex-col h-screen mx-auto">
        <div className="flex flex-col items-center justify-center w-full pt-20">
          <Stepper step={step} />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center flex-1">
            <div className="loader border-t-4 border-bluez rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-4 text-lg text-gray-600">Processing...</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 pb-20">
            <Formik
              initialValues={formValues}
              enableReinitialize={true}
              validationSchema={validationSchemas[step - 1]}
              onSubmit={async (values, formikHelpers) => {
                if (step === 3) {
                  await handleVerifyCode(values)
                  setStep(step + 1)
                  formikHelpers.setSubmitting(false)
                } else if (step === 4) {
                  setIsLoading(true)
                  setTimeout(async () => {
                    try {
                      await handleSubmit(values, formikHelpers)
                    } catch (error) {
                      console.error('Error during submission:', error)
                    } finally {
                      setIsLoading(false)
                    }
                    formikHelpers.setSubmitting(false)
                  }, 2000)
                } else {
                  setStep(step + 1)
                  formikHelpers.setSubmitting(false)
                }
              }}
            >
              {({ values, setFieldValue, isSubmitting, isValid }) => (
                <Form className="w-3/4 mx-auto flex flex-col flex-1">
                  {/* Content area with fixed height and scroll if needed */}
                  <div className="flex-1 space-y-4 overflow-y-auto min-h-0 px-1 mb-6">
                    {renderStepFields(setFieldValue, values)}
                  </div>

                  {/* Fixed button area */}
                  <div className="flex-shrink-0 space-y-4">
                    <div className="flex justify-end space-x-5">
                      {step > 1 && (
                        <Button
                          type="button"
                          onClick={() => setStep(step - 1)}
                          className="bg-gray-500 hover:bg-gray-600 btn-shadow addgrotesk"
                        >
                          Previous
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="bg-bluez btn-shadow addgrotesk text-black hover:text-white"
                        disabled={isSubmitting || !isValid}
                      >
                        {step === 4 ? 'Submit' : 'Next'}
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <Link
                        to="/login"
                        className="text-blue-500 hover:underline"
                      >
                        <Button variant={'link'}>
                          Already have an account?
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignupForm
