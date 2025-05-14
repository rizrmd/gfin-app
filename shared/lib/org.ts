export type OrgState = {
  entry: Partial<{
    name: string;
    state: string;
  }>;
  final: Partial<typeof sampleOrg>;
};

export const sampleOrg = {
  entityName: "",
  entityNumber: "",
  feiNumber: "",
  status: "",
  filingInformation: {
    filingType: "",
    filingDate: "",
    effectiveDate: "",
    state: "",
    lastEvent: "",
    lastEventDate: "",
    principalAddress: "",
  },
  mailingAddress: "",
  registeredAgent: {
    name: "",
    address: "",
  },
  authorizedPersons: [
    {
      title: "",
      name: "",
      address: "",
    },
  ],
};
