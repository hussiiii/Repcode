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
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Contact us
          </h1>
          <p className="text-muted-foreground mb-2">
            Questions? Bugs? Want to contribute? Let us know!
          </p>
          <p className="text-muted-foreground">
            Email repcode.io@gmail.com, or fill out the form below.
          </p>
        </div>
      </div>

      <div className="mt-12 max-w-lg mx-auto">
        <div className="bg-background rounded-xl border border-border shadow-lg overflow-hidden p-6">
          {state.succeeded ? (
            <div className="bg-marketing-feedback-success/10 border border-marketing-feedback-success/30 rounded-lg p-4 mb-6">
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
            </div>
          ) : state.errors ? (
            <div className="bg-marketing-feedback-error/10 border border-marketing-feedback-error/30 rounded-lg p-4 mb-6">
              <p className="text-marketing-feedback-error flex items-center">
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
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstname" className="block text-muted-foreground text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-placeholder focus:outline-none focus:border-marketing-focus transition-colors"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastname" className="block text-muted-foreground text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-placeholder focus:outline-none focus:border-marketing-focus transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-muted-foreground text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-placeholder focus:outline-none focus:border-marketing-focus transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="details" className="block text-muted-foreground text-sm font-medium mb-2">
                Details
              </label>
              <textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-placeholder focus:outline-none focus:border-marketing-focus transition-colors"
                placeholder="Your message..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={state.submitting}
              className="w-full bg-gradient-to-r from-marketing-action-start to-marketing-action-end hover:from-marketing-action-hover-start hover:to-marketing-action-hover-end text-marketing-action-foreground py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-marketing-action-hover disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {state.submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </button>
            
            <div className="mt-3 text-center">
              <p className="text-sm text-muted-foreground">
                We will get back to you in 1-2 business days.
              </p>
            </div>
          </form>
        </div>
      </div>

      
    </div>
  );
};

export default ContactForm;