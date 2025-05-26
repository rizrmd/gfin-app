import { EForm } from "@/components/ext/eform";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/gen/api";
import { useLocal } from "@/lib/hooks/use-local";
import { orgState } from "@/lib/states/org-state";
import type { OrganizationData } from "shared/lib/client_state";
import { blankOrg } from "shared/lib/client_state";
import { useSnapshot } from "valtio";

export const SummaryProfile = () => {
  const orgRead = useSnapshot(orgState.write);

  const local = useLocal({ isSubmitting: false }, async () => {
    local.render();
  });

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <EForm
        data={
          {
            ...blankOrg,
            ...((orgRead.data as OrganizationData) || {}),
            loading: false,
          } as OrganizationData & { loading: boolean }
        }
        onSubmit={async ({ write, read }) => {
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
                previousContractsGrants: read.previousContractsGrants,
              },
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
        }}
        className="space-y-8"
      >
        {({ Field, Section, read }) => (
          <>
            <div className="sticky top-0 bg-background z-10 py-4 mb-8 border-b flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Organization Profile</h1>
                <p className="text-muted-foreground">
                  Complete your organization details
                </p>
              </div>
              <Button
                type="submit"
                disabled={read.loading || local.isSubmitting}
              >
                {local.isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>

            <Section title="Entity Information">
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
            </Section>

            <Section title="Legal Structure">
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
            </Section>

            <Section title="Filing Information">
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
            </Section>

            {/* Add more sections as needed */}
          </>
        )}
      </EForm>
    </div>
  );
};

export default SummaryProfile;
