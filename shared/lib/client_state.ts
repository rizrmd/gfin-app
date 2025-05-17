export type ORG_ID = string;

export type ClientState = {
  client_id: string;
};

export const blankProfile = {
  firstName: "",
  lastName: "",
  workEmail: "",
  password: "",
};

export const blankOrg = {
  entityInformation: {
    entityName: "",
    entityNumber: "",
    feiNumber: "",
    status: "",
    legalStructure: {
      type: "",
      yearEstablished: "",
      numberOfEmployees: "",
      annualRevenue: "",
    },
  },
  filingInformation: {
    filingType: "",
    filingDate: "",
    effectiveDate: "",
    state: "",
    lastEvent: "",
    lastEventDate: "",
  },
  contactInformation: {
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    phone: "",
    authorizedPersons: [
      {
        title: "",
        name: "",
        address: "",
      },
    ],
  },
  addresses: {
    principalAddress: "",
    mailingAddress: "",
    primaryOfficeAddress: {
      streetAddress: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    registeredAgent: {
      name: "",
      address: "",
    },
  },
  businessClassification: {
    minorityOwned: "",
    veteranOwned: false,
    smallBusinessAdministration: false,
    womanOwned: "",
    hubZone: false,
    nonProfit: false,
  },
  capabilities: {
    capabilitiesStatement: "",
    coreServicesProducts: "",
  },
  previousContractsGrants: [
    {
      contractGrantName: "",
      awardingAgency: "",
      awardAmount: "",
      completionDate: "",
      performanceSummary: "",
    },
  ],
};
