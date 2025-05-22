import { Button } from "@/components/ui/button";
import { Form } from "@/components/ext/eform/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocal } from "@/lib/hooks/use-local";
import type { OrganizationData } from 'shared/lib/client_state';
import { orgState } from "@/lib/states/org-state";
import { useSnapshot } from "valtio";
import { api } from "@/lib/gen/api";
import { blankOrg } from "shared/lib/client_state";

export const SummaryProfile = () => {
  const orgRead = useSnapshot(orgState.write);
  
  const local = useLocal({ isSubmitting: false }, async () => {
    // Async initialization if needed
    local.render();
  });

  const handleSubmit = async (
    { write, read }: { write: any; read: OrganizationData & { loading: boolean } }
  ) => {
    try {
      write.loading = true;
      local.isSubmitting = true;
      local.render();

      // Update organization data via API
      await api.ai_onboard({
        id: orgRead.id,
        mode: "update",
        data: {
          entityInformation: read.entityInformation,
          filingInformation: read.filingInformation,
          contactInformation: read.contactInformation,
          addresses: read.addresses,
          businessClassification: read.businessClassification,
          capabilities: read.capabilities,
          previousContractsGrants: read.previousContractsGrants
        }
      });

      // Update onboarding state
      orgState.write.onboard.profile = true;
      
      local.isSubmitting = false;
      write.loading = false;
      local.render();
    } catch (error) {
      console.error("Error submitting organization profile:", error);
      write.loading = false;
      local.isSubmitting = false;
      local.render();
    }
  };

  // Get the organization data or use blank defaults
  const orgData = orgRead.data as OrganizationData || blankOrg;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Organization Profile</CardTitle>
        <CardDescription>
          Please complete your organization profile information below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          data={{
            // Using spread to create a new copy of the blank organization data
            ...blankOrg,
            // Merge in any existing data if available
            ...(orgRead.data as OrganizationData || {}),
            loading: false,
          }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {({ Field, read }) => {
            return (
              <>
                {/* Entity Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Entity Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      name="entityInformation.entityName"
                      disabled={read.loading}
                      label="Entity Name"
                    />
                    <Field
                      name="entityInformation.entityNumber"
                      disabled={read.loading}
                      label="Entity Number"
                    />
                    <Field
                      name="entityInformation.feiNumber"
                      disabled={read.loading}
                      label="FEI Number"
                    />
                    <Field
                      name="entityInformation.status"
                      disabled={read.loading}
                      label="Status"
                    />
                    <Field
                      name="entityInformation.entityWebsite"
                      disabled={read.loading}
                      label="Website"
                      type="url"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-md font-medium mb-2">Legal Structure</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        name="entityInformation.legalStructure.type"
                        disabled={read.loading}
                        label="Type"
                      />
                      <Field
                        name="entityInformation.legalStructure.yearEstablished"
                        disabled={read.loading}
                        label="Year Established"
                      />
                      <Field
                        name="entityInformation.legalStructure.numberOfEmployees"
                        disabled={read.loading}
                        label="Number of Employees"
                      />
                      <Field
                        name="entityInformation.legalStructure.annualRevenue"
                        disabled={read.loading}
                        label="Annual Revenue"
                      />
                    </div>
                  </div>
                </div>

                {/* Filing Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Filing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      name="filingInformation.filingType"
                      disabled={read.loading}
                      label="Filing Type"
                    />
                    <Field
                      name="filingInformation.filingDate"
                      disabled={read.loading}
                      label="Filing Date"
                      type="date"
                    />
                    <Field
                      name="filingInformation.effectiveDate"
                      disabled={read.loading}
                      label="Effective Date"
                      type="date"
                    />
                    <Field
                      name="filingInformation.state"
                      disabled={read.loading}
                      label="State"
                    />
                    <Field
                      name="filingInformation.lastEvent"
                      disabled={read.loading}
                      label="Last Event"
                    />
                    <Field
                      name="filingInformation.lastEventDate"
                      disabled={read.loading}
                      label="Last Event Date"
                      type="date"
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      name="contactInformation.firstName"
                      disabled={read.loading}
                      label="First Name"
                    />
                    <Field
                      name="contactInformation.lastName"
                      disabled={read.loading}
                      label="Last Name"
                    />
                    <Field
                      name="contactInformation.email"
                      disabled={read.loading}
                      label="Email"
                      type="email"
                    />
                    <Field
                      name="contactInformation.jobTitle"
                      disabled={read.loading}
                      label="Job Title"
                    />
                    <Field
                      name="contactInformation.phone"
                      disabled={read.loading}
                      label="Phone"
                      type="tel"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-md font-medium mb-2">Authorized Persons</h4>
                    {read.contactInformation.authorizedPersons.map((_, index) => (
                      <div key={index} className="border rounded-md p-3 mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field
                            name={`contactInformation.authorizedPersons.${index}.title`}
                            disabled={read.loading}
                            label="Title"
                          />
                          <Field
                            name={`contactInformation.authorizedPersons.${index}.name`}
                            disabled={read.loading}
                            label="Name"
                          />
                          <Field
                            name={`contactInformation.authorizedPersons.${index}.address`}
                            disabled={read.loading}
                            label="Address"
                            className="md:col-span-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Addresses Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Addresses</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Field
                      name="addresses.principalAddress"
                      disabled={read.loading}
                      label="Principal Address"
                    />
                    <Field
                      name="addresses.mailingAddress"
                      disabled={read.loading}
                      label="Mailing Address"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-md font-medium mb-2">Primary Office Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        name="addresses.primaryOfficeAddress.streetAddress"
                        disabled={read.loading}
                        label="Street Address"
                        className="md:col-span-2"
                      />
                      <Field
                        name="addresses.primaryOfficeAddress.city"
                        disabled={read.loading}
                        label="City"
                      />
                      <Field
                        name="addresses.primaryOfficeAddress.state"
                        disabled={read.loading}
                        label="State"
                      />
                      <Field
                        name="addresses.primaryOfficeAddress.country"
                        disabled={read.loading}
                        label="Country"
                      />
                      <Field
                        name="addresses.primaryOfficeAddress.zipCode"
                        disabled={read.loading}
                        label="Zip Code"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-md font-medium mb-2">Registered Agent</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        name="addresses.registeredAgent.name"
                        disabled={read.loading}
                        label="Name"
                      />
                      <Field
                        name="addresses.registeredAgent.address"
                        disabled={read.loading}
                        label="Address"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Classification Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Classification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      name="businessClassification.minorityOwned"
                      disabled={read.loading}
                      label="Minority Owned"
                    />
                    <Field
                      name="businessClassification.womanOwned"
                      disabled={read.loading}
                      label="Woman Owned"
                    />
                    <Field
                      name="businessClassification.veteranOwned"
                      disabled={read.loading}
                      label="Veteran Owned"
                      type="checkbox"
                    />
                    <Field
                      name="businessClassification.smallBusinessAdministration"
                      disabled={read.loading}
                      label="Small Business Administration"
                      type="checkbox"
                    />
                    <Field
                      name="businessClassification.hubZone"
                      disabled={read.loading}
                      label="HUBZone"
                      type="checkbox"
                    />
                    <Field
                      name="businessClassification.nonProfit"
                      disabled={read.loading}
                      label="Non-Profit"
                      type="checkbox"
                    />
                  </div>
                </div>

                {/* Capabilities Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Capabilities</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Capabilities Statement</label>
                      <textarea 
                        value={read.capabilities.capabilitiesStatement}
                        onChange={(e) => {
                          const form = document.querySelector('form');
                          const field = form?.querySelector('[name="capabilities.capabilitiesStatement"]') as HTMLInputElement;
                          if (field) {
                            field.value = e.target.value;
                            field.dispatchEvent(new Event('change', { bubbles: true }));
                          }
                        }}
                        disabled={read.loading}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <Field
                        name="capabilities.capabilitiesStatement"
                        disabled={read.loading}
                        className="hidden"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Core Services/Products</label>
                      <textarea 
                        value={read.capabilities.coreServicesProducts}
                        onChange={(e) => {
                          const form = document.querySelector('form');
                          const field = form?.querySelector('[name="capabilities.coreServicesProducts"]') as HTMLInputElement;
                          if (field) {
                            field.value = e.target.value;
                            field.dispatchEvent(new Event('change', { bubbles: true }));
                          }
                        }}
                        disabled={read.loading}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <Field
                        name="capabilities.coreServicesProducts"
                        disabled={read.loading}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Previous Contracts/Grants Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Previous Contracts/Grants</h3>
                  {read.previousContractsGrants.map((_, index) => (
                    <div key={index} className="border rounded-md p-3 mb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                          name={`previousContractsGrants.${index}.contractGrantName`}
                          disabled={read.loading}
                          label="Contract/Grant Name"
                        />
                        <Field
                          name={`previousContractsGrants.${index}.awardingAgency`}
                          disabled={read.loading}
                          label="Awarding Agency"
                        />
                        <Field
                          name={`previousContractsGrants.${index}.awardAmount`}
                          disabled={read.loading}
                          label="Award Amount"
                        />
                        <Field
                          name={`previousContractsGrants.${index}.completionDate`}
                          disabled={read.loading}
                          label="Completion Date"
                          type="date"
                        />
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-sm font-medium">Performance Summary</label>
                          <textarea 
                            value={read.previousContractsGrants[index].performanceSummary}
                            onChange={(e) => {
                              const form = document.querySelector('form');
                              const field = form?.querySelector(`[name="previousContractsGrants.${index}.performanceSummary"]`) as HTMLInputElement;
                              if (field) {
                                field.value = e.target.value;
                                field.dispatchEvent(new Event('change', { bubbles: true }));
                              }
                            }}
                            disabled={read.loading}
                            rows={2}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <Field
                            name={`previousContractsGrants.${index}.performanceSummary`}
                            disabled={read.loading}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={read.loading || local.isSubmitting}
                  >
                    {read.loading || local.isSubmitting ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
      </CardContent>
    </Card>
  );
};

export default SummaryProfile;