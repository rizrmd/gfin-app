import { EForm } from "@/components/ext/eform";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/gen/api";
import { useLocal } from "@/lib/hooks/use-local";
import { orgState } from "@/lib/states/org-state";
import type { OrganizationData } from "shared/lib/client_state";
import { blankOrg } from "shared/lib/client_state";
import { useSnapshot } from "valtio";
import { useEffect } from "react";
import { user } from "@/lib/user";

type LocalState = {
  isSubmitting: boolean;
  error?: string;
};

export const SummaryProfile = () => {
  user.init();
  useEffect(() => {
  if (!orgState.write.id && user.organization?.id) {
    orgState.write.id = user.organization.id;
  }
  }, []);

  const orgRead = useSnapshot(orgState.write);

  // Debug log to trace orgRead value on every render
  console.log("orgRead in SummaryProfile:", orgRead);

  const local = useLocal<LocalState>(
  {
    isSubmitting: false,
    error: undefined,
  },
  async () => {
    local.render();
  }
);

const isReady = !!orgRead.id;

  useEffect(() => {
  if (!orgRead.id) return;

  console.log("🔁 useEffect checking id:", orgRead.id);
  api["ai_get-profile"]({ organizationId: orgRead.id }).then((res) => {
    console.log("📥 Response from ai_get-profile:", res);
    if (res?.data) {
      // Object.assign(orgState.write, { ...blankOrg, ...res.data });
      orgState.write.data = { ...blankOrg, ...res.data };
      local.render();
    }
  });
}, [orgRead.id]);



  const handleAuthorizedPersonAdd = (write: OrganizationData & { loading: boolean }) => {
    const newPersons = [...(write.contactInformation.authorizedPersons || [])];
    newPersons.push({ title: "", name: "", address: "" });
    write.contactInformation.authorizedPersons = newPersons;
  };

  const handleAuthorizedPersonRemove = (write: OrganizationData & { loading: boolean }, index: number) => {
    const updated = [...(write.contactInformation.authorizedPersons || [])];
    updated.splice(index, 1);
    write.contactInformation.authorizedPersons = updated;
  };

  const handleContractAdd = (write: OrganizationData & { loading: boolean }) => {
    const newContracts = [...(write.previousContractsGrants || [])];
    newContracts.push({
      contractGrantName: "",
      awardingAgency: "",
      awardAmount: "",
      completionDate: "",
      performanceSummary: "",
    });
    write.previousContractsGrants = newContracts;
  };

  const handleContractRemove = (write: OrganizationData & { loading: boolean }, index: number) => {
    const updated = [...(write.previousContractsGrants || [])];
    updated.splice(index, 1);
    write.previousContractsGrants = updated;
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {!isReady ? (
        <p>Loading profile...</p>
      ) : (
        <>
          {local.error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
              {local.error}
            </div>
          )}
          <EForm
        data={{
          ...blankOrg,
          ...(orgRead.data as OrganizationData),
          loading: false,
        }}
        onSubmit={async ({ write, read }) => {
          try {
            write.loading = true;
            local.isSubmitting = true;
            local.error = undefined;
            local.render();

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
                previousContractsGrants: read.previousContractsGrants,
              },
            });

            orgState.write.onboard.profile = true;
          } catch (error) {
            local.error = error instanceof Error ? error.message : "An error occurred while saving";
          } finally {
            local.isSubmitting = false;
            write.loading = false;
            local.render();
          }
        }}
        className="space-y-8"
      >
        {({ Field, Section, read, write }) => (
          <>
            <div className="sticky top-0 bg-background z-10 py-4 mb-8 border-b flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Organization Profile</h1>
                <p className="text-muted-foreground">Complete your organization details</p>
              </div>
              <Button type="submit" disabled={read.loading || local.isSubmitting}>
                {local.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>

            <Section title="Entity Information">
              <Field name="entityInformation.entityName" disabled={read.loading} label="Entity Name" />
              <Field name="entityInformation.entityNumber" disabled={read.loading} label="Entity Number" />
              <Field name="entityInformation.feiNumber" disabled={read.loading} label="FEI Number" />
              <Field name="entityInformation.status" disabled={read.loading} label="Status" />
              <Field name="entityInformation.entityWebsite" disabled={read.loading} label="Website" type="url" />
            </Section>

            <Section title="Legal Structure">
              <Field name="entityInformation.legalStructure.type" disabled={read.loading} label="Type" />
              <Field name="entityInformation.legalStructure.yearEstablished" disabled={read.loading} label="Year Established" />
              <Field name="entityInformation.legalStructure.numberOfEmployees" disabled={read.loading} label="Number of Employees" />
              <Field name="entityInformation.legalStructure.annualRevenue" disabled={read.loading} label="Annual Revenue" />
            </Section>

            <Section title="Filing Information">
              <Field name="filingInformation.filingType" disabled={read.loading} label="Filing Type" />
              <Field name="filingInformation.filingDate" disabled={read.loading} label="Filing Date" type="date" />
              <Field name="filingInformation.effectiveDate" disabled={read.loading} label="Effective Date" type="date" />
              <Field name="filingInformation.state" disabled={read.loading} label="State" />
              <Field name="filingInformation.lastEvent" disabled={read.loading} label="Last Event" />
              <Field name="filingInformation.lastEventDate" disabled={read.loading} label="Last Event Date" type="date" />
            </Section>

            <Section title="Contact Information">
              <Field name="contactInformation.firstName" disabled={read.loading} label="First Name" />
              <Field name="contactInformation.lastName" disabled={read.loading} label="Last Name" />
              <Field name="contactInformation.email" disabled={read.loading} label="Email" type="email" />
              <Field name="contactInformation.jobTitle" disabled={read.loading} label="Job Title" />
              <Field name="contactInformation.phone" disabled={read.loading} label="Phone" />

              <div className="mt-4 space-y-4">
                <label className="font-medium">Authorized Persons</label>
                {read.contactInformation?.authorizedPersons?.map((_, index) => (
                  <div key={index} className="pl-4 border-l space-y-2 relative">
                    <Field name={`contactInformation.authorizedPersons.${index}.title`} disabled={read.loading} label={`Title`} />
                    <Field name={`contactInformation.authorizedPersons.${index}.name`} disabled={read.loading} label={`Name`} />
                    <Field name={`contactInformation.authorizedPersons.${index}.address`} disabled={read.loading} label={`Address`} />
                    <Button
                      type="button"
                      variant="destructive"
                      className="absolute top-0 right-0"
                      onClick={() => handleAuthorizedPersonRemove(write, index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => handleAuthorizedPersonAdd(write)}
                >
                  Add Authorized Person
                </Button>
              </div>
            </Section>

            <Section title="Addresses">
              <Field name="addresses.principalAddress" disabled={read.loading} label="Principal Address" />
              <Field name="addresses.mailingAddress" disabled={read.loading} label="Mailing Address" />
              <Field name="addresses.primaryOfficeAddress.streetAddress" disabled={read.loading} label="Office Street Address" />
              <Field name="addresses.primaryOfficeAddress.city" disabled={read.loading} label="Office City" />
              <Field name="addresses.primaryOfficeAddress.state" disabled={read.loading} label="Office State" />
              <Field name="addresses.primaryOfficeAddress.country" disabled={read.loading} label="Office Country" />
              <Field name="addresses.primaryOfficeAddress.zipCode" disabled={read.loading} label="Office Zip Code" />
              <Field name="addresses.registeredAgent.name" disabled={read.loading} label="Registered Agent Name" />
              <Field name="addresses.registeredAgent.address" disabled={read.loading} label="Registered Agent Address" />
            </Section>

            <Section title="Business Classification">
              <Field name="businessClassification.minorityOwned" disabled={read.loading} label="Minority Owned" type="checkbox" />
              <Field name="businessClassification.veteranOwned" disabled={read.loading} label="Veteran Owned" type="checkbox" />
              <Field name="businessClassification.smallBusinessAdministration" disabled={read.loading} label="Small Business Administration" type="checkbox" />
              <Field name="businessClassification.womanOwned" disabled={read.loading} label="Woman Owned" type="checkbox" />
              <Field name="businessClassification.hubZone" disabled={read.loading} label="HubZone" type="checkbox" />
              <Field name="businessClassification.nonProfit" disabled={read.loading} label="Non-Profit" type="checkbox" />
            </Section>

            <Section title="Capabilities">
              <Field name="capabilities.capabilitiesStatement" disabled={read.loading} label="Capabilities Statement" />
              <Field name="capabilities.coreServicesProducts" disabled={read.loading} label="Core Services & Products" />
            </Section>

            <Section title="Previous Contracts & Grants">
              <div className="space-y-4">
                {read.previousContractsGrants?.map((_, index) => (
                  <div key={index} className="pl-4 border-l space-y-2 relative">
                    <Field name={`previousContractsGrants.${index}.contractGrantName`} disabled={read.loading} label="Contract/Grant Name" />
                    <Field name={`previousContractsGrants.${index}.awardingAgency`} disabled={read.loading} label="Awarding Agency" />
                    <Field name={`previousContractsGrants.${index}.awardAmount`} disabled={read.loading} label="Award Amount" />
                    <Field name={`previousContractsGrants.${index}.completionDate`} disabled={read.loading} label="Completion Date" type="date" />
                    <Field name={`previousContractsGrants.${index}.performanceSummary`} disabled={read.loading} label="Performance Summary" />
                    <Button
                      type="button"
                      variant="destructive"
                      className="absolute top-0 right-0"
                      onClick={() => handleContractRemove(write, index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => handleContractAdd(write)}
                >
                  Add Contract/Grant
                </Button>
              </div>
            </Section>
          </>
        )}
    </EForm>
    </>
    )}
    </div>
  );
};

export default SummaryProfile;
