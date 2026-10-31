import { Heading } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel, Field, FieldError } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from '@formspree/react';

const ContactForm = () => {
  const [state, handleSubmit] = useForm("xkndvdrp");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    details: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Map form field names to state property names
    const fieldMap: {[key: string]: string} = {
      'firstname': 'firstname',
      'lastname': 'lastname',
      'email': 'email',
      'details': 'details'
    };
    
    const stateField = fieldMap[name] || name;
    setFormData((prev) => ({ ...prev, [stateField]: value }));
  };

  // Reset form after success
  useEffect(() => {
    if (state.succeeded) {
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        details: "",
      });
      
      // Reset success message after 5 seconds (optional)
      // setTimeout(() => {
      //   // We don't need to reset state.succeeded as Formspree handles this
      // }, 5000);
    }
  }, [state.succeeded]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="max-w-xl mx-auto">
        <div className="text-center">
          <Heading as="h2" size="publicTitle" weight="bold" tone="foreground" className="mb-4">
            Contact us
          </Heading>
          <p className="text-muted-foreground mb-2">
            Questions? Bugs? Want to contribute? Let us know!
          </p>
          <p className="text-muted-foreground">
            Email repcode.io@gmail.com, or fill out the form below.
          </p>
        </div>
      </div>

      <div className="mt-12 max-w-lg mx-auto">
        <Card surface="page" padding="xl" className="overflow-hidden">
          {state.succeeded ? (
            <Alert variant="marketingSuccess" role="status" className="mb-6">
              <p className="text-marketing-feedback-success flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Thanks! We&apos;ll get back to you soon!
              </p>
            </Alert>
          ) : state.errors ? (
            <Alert variant="marketingError" className="mb-6">
              <FieldError variant="marketing" role="presentation">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                There was an error submitting the form. Please try again.
              </FieldError>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Field>
                <FieldLabel variant="marketing" >
                  First Name
                </FieldLabel>
                <Input variant="marketing" className="w-full" controlSize="natural"
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                />
              </Field>
              <Field>
                <FieldLabel variant="marketing" >
                  Last Name
                </FieldLabel>
                <Input variant="marketing" className="w-full" controlSize="natural"
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                />
              </Field>
            </div>

            <Field className="mb-6">
              <FieldLabel variant="marketing" >
                Email
              </FieldLabel>
              <Input variant="marketing" className="w-full" controlSize="natural"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </Field>

            <Field className="mb-6">
              <FieldLabel variant="marketing" >
                Details
              </FieldLabel>
              <Textarea variant="marketing" className="w-full"
                name="details"
                value={formData.details}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Your message..."
              ></Textarea>
            </Field>

            <Button variant="marketing" size="large" className="w-full" emphasis="marketingForm" loading={state.submitting}
              type="submit"
              disabled={state.submitting}>
              {state.submitting ? (
                <>
                  <Spinner variant="button" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </Button>
            
            <div className="mt-3 text-center">
              <p className="text-sm text-muted-foreground">
                We will get back to you in 1-2 business days.
              </p>
            </div>
          </form>
        </Card>
      </div>

      
    </div>
  );
};

export default ContactForm;
