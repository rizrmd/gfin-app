import { EForm } from "@/components/ext/eform";
import { blankOrg } from "shared/lib/client_state";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { proxy } from "valtio";
import { user } from "@/lib/user";
import type { OrganizationData } from "shared/lib/client_state";
import { api } from "@/lib/gen/api"; // Update import path

export const orgWrite = {
  write: proxy({
    ...blankOrg,
    loading: false,
    initialized: false // tambah flag initialized
  }),
  reset() {
    Object.assign(this.write, { ...blankOrg, loading: false, initialized: false });
  }
};

export default () => {
  user.init();
  const read = useSnapshot(orgWrite.write);

  useEffect(() => {
    const fetchData = async () => {
      const organizationId = user.organization?.id;
      if (organizationId) {
        orgWrite.write.loading = true;
        try {
          const res = await api.getOrgProfile({ organizationId }); // Update the API method name
          if (res?.data) {
            function deepAssign(target: any, source: any) {
              for (const key in source) {
                if (
                  source[key] &&
                  typeof source[key] === "object" &&
                  !Array.isArray(source[key]) &&
                  target[key]
                ) {
                  deepAssign(target[key], source[key]);
                } else {
                  target[key] = source[key];
                }
              }
            }
            deepAssign(orgWrite.write, res.data);
            orgWrite.write.initialized = true;
          }
        } catch (error) {
        }
        orgWrite.write.loading = false;
      }
    };
    fetchData();
  }, []);

  if (!read.initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <EForm
        data={read}
        onSubmit={async ({ write }) => {
          orgWrite.write.loading = true;
          try {
            const organizationId = user.organization?.id;
            const userId = user.client?.id;
            
            if (!organizationId || !userId) {
              throw new Error("Organization ID or User ID not found");
            }
            
            const res = await api["profile-org_update-org-profile"]({
              data: write as unknown as OrganizationData,
              orgId: organizationId,
              userId: userId
            });

            if (!res.success) {
              throw new Error(res.message || "Failed to update profile");
            }
            
            // Reload the data from server to ensure we have the latest state
            const updatedProfile = await api.getOrgProfile({ organizationId });
            if (updatedProfile?.data) {
              function deepAssign(target: any, source: any) {
                for (const key in source) {
                  if (
                    source[key] &&
                    typeof source[key] === "object" &&
                    !Array.isArray(source[key]) &&
                    target[key]
                  ) {
                    deepAssign(target[key], source[key]);
                  } else {
                    target[key] = source[key];
                  }
                }
              }
              deepAssign(orgWrite.write, updatedProfile.data);
            }
          } catch (error) {
            console.error("Error updating profile:", error);
            // Here you might want to show an error notification to the user
          } finally {
            orgWrite.write.loading = false;
          }
        }}
        className="space-y-8"
      >
        {({ Field, Section }) => (
          <>
            <Section title="Entity Information" className="grid grid-cols-2 gap-4">
              <Field name="entityInformation.entityName" label="Entity Name" />
              <Field name="entityInformation.entityNumber" label="Entity Number" />
              <Field name="entityInformation.feiNumber" label="FEI Number" />
              <Field name="entityInformation.status" label="Status" />
              <Field name="entityInformation.entityWebsite" label="Website" />
              <Field name="entityInformation.legalStructure.type" label="Legal Structure Type" />
              <Field name="entityInformation.legalStructure.yearEstablished" label="Year Established" />
              <Field name="entityInformation.legalStructure.numberOfEmployees" label="Number of Employees" />
              <Field name="entityInformation.legalStructure.annualRevenue" label="Annual Revenue" />
            </Section>
            <Section title="Filing Information" className="grid grid-cols-2 gap-4">
              <Field name="filingInformation.filingType" label="Filing Type" />
              <Field name="filingInformation.filingDate" label="Filing Date" />
              <Field name="filingInformation.effectiveDate" label="Effective Date" />
              <Field name="filingInformation.state" label="State" />
              <Field name="filingInformation.lastEvent" label="Last Event" />
              <Field name="filingInformation.lastEventDate" label="Last Event Date" />
            </Section>
            <Section title="Contact Information" className="grid grid-cols-2 gap-4">
              <Field name="contactInformation.firstName" label="First Name" />
              <Field name="contactInformation.lastName" label="Last Name" />
              <Field name="contactInformation.email" label="Email" />
              <Field name="contactInformation.jobTitle" label="Job Title" />
              <Field name="contactInformation.phone" label="Phone" />
            </Section>
            <Section title="Addresses" className="grid grid-cols-2 gap-4">
              <Field name="addresses.principalAddress" label="Principal Address" />
              <Field name="addresses.mailingAddress" label="Mailing Address" />
              <Field name="addresses.primaryOfficeAddress.streetAddress" label="Primary Office Address" />
            </Section>
            <div className="flex justify-end">
              <button
                type="submit"
                className={cn(
                  "px-4 py-2 bg-primary text-primary-foreground rounded-md",
                  "hover:bg-primary/90 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={read.loading}
              >
                {read.loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </EForm>
    </div>
  );
};
