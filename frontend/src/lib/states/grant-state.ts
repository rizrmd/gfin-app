import { proxy } from "valtio";

export const grantState = {
  write: proxy({
    filters: {
      search: "",
      solicitation: "all",
      location: "all",
      title: "",
      date: ""
    },
    grants: [] as Grant[],
    loading: false,
    showMobileFilters: false,
    pagination: {
      currentPage: 1,
      itemsPerPage: 15,
      totalItems: 0
    }
  }),
  async fetch() {
    this.write.loading = true;
    
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data using current date context
    this.write.grants = [
      {
        id: "1",
        title: "Construction Security Enhancement Project",
        description: "Security enhancement project for government facilities in downtown area",
        postedDate: "2025-05-01",
        closeDate: "2025-07-31",
        amount: "250,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "2",
        title: "USAID Democratic Governance Initiative",
        description: "Support democratic institutions and processes in developing regions",
        postedDate: "2025-05-15",
        closeDate: "2025-08-15",
        amount: "500,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "3",
        title: "Hospital Infrastructure Modernization",
        description: "Modernization of medical facilities and infrastructure",
        postedDate: "2025-05-20",
        closeDate: "2025-09-01",
        amount: "750,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "4",
        title: "USAID Education Technology Program",
        description: "Implementation of technology solutions in rural schools",
        postedDate: "2025-05-22",
        closeDate: "2025-08-30",
        amount: "300,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "5",
        title: "Green Building Retrofit Project",
        description: "Sustainable renovation of government buildings",
        postedDate: "2025-05-25",
        closeDate: "2025-09-15",
        amount: "450,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "6",
        title: "USAID Healthcare Access Initiative",
        description: "Improving healthcare accessibility in underserved regions",
        postedDate: "2025-06-01",
        closeDate: "2025-09-30",
        amount: "600,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "7",
        title: "Transportation Hub Construction",
        description: "Development of multimodal transportation facility",
        postedDate: "2025-06-05",
        closeDate: "2025-10-05",
        amount: "1,200,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "8",
        title: "USAID Clean Water Project",
        description: "Water sanitation and access improvement program",
        postedDate: "2025-06-10",
        closeDate: "2025-09-20",
        amount: "400,000",
        solicitationType: "usaid",
        locationType: "hybrid"
      },
      {
        id: "9",
        title: "School Renovation Program",
        description: "Comprehensive renovation of public schools",
        postedDate: "2025-06-15",
        closeDate: "2025-10-15",
        amount: "850,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "10",
        title: "USAID Agricultural Development",
        description: "Sustainable farming practices implementation",
        postedDate: "2025-06-20",
        closeDate: "2025-10-01",
        amount: "350,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "11",
        title: "Emergency Response Center Construction",
        description: "Building state-of-the-art emergency response facility",
        postedDate: "2025-06-25",
        closeDate: "2025-10-30",
        amount: "900,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "12",
        title: "USAID Digital Literacy Program",
        description: "Digital skills training for rural communities",
        postedDate: "2025-07-01",
        closeDate: "2025-10-15",
        amount: "275,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "13",
        title: "Smart City Infrastructure Project",
        description: "Implementation of smart city technologies",
        postedDate: "2025-07-05",
        closeDate: "2025-11-05",
        amount: "1,500,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "14",
        title: "USAID Women Empowerment Initiative",
        description: "Economic empowerment program for women entrepreneurs",
        postedDate: "2025-07-10",
        closeDate: "2025-10-31",
        amount: "425,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "15",
        title: "Public Library Modernization",
        description: "Renovation and modernization of public libraries",
        postedDate: "2025-07-15",
        closeDate: "2025-11-15",
        amount: "550,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "16",
        title: "USAID Renewable Energy Project",
        description: "Implementation of renewable energy solutions",
        postedDate: "2025-07-20",
        closeDate: "2025-11-30",
        amount: "800,000",
        solicitationType: "usaid",
        locationType: "hybrid"
      },
      {
        id: "17",
        title: "Community Center Development",
        description: "Construction of multipurpose community centers",
        postedDate: "2025-07-25",
        closeDate: "2025-12-01",
        amount: "675,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "18",
        title: "USAID Youth Skills Program",
        description: "Vocational training for youth employment",
        postedDate: "2025-08-01",
        closeDate: "2025-11-30",
        amount: "350,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "19",
        title: "Healthcare Facility Expansion",
        description: "Expansion of existing healthcare facilities",
        postedDate: "2025-08-05",
        closeDate: "2025-12-15",
        amount: "950,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "20",
        title: "USAID Small Business Support",
        description: "Financial and technical assistance for small businesses",
        postedDate: "2025-08-10",
        closeDate: "2025-12-10",
        amount: "475,000",
        solicitationType: "usaid",
        locationType: "remote"
      },
      {
        id: "21",
        title: "Urban Park Development Project",
        description: "Construction of recreational facilities and green spaces",
        postedDate: "2025-08-15",
        closeDate: "2025-12-20",
        amount: "725,000",
        solicitationType: "construction",
        locationType: "onsite"
      },
      {
        id: "22",
        title: "USAID Climate Resilience Program",
        description: "Building climate resilience in vulnerable communities",
        postedDate: "2025-08-20",
        closeDate: "2025-12-31",
        amount: "650,000",
        solicitationType: "usaid",
        locationType: "hybrid"
      }
    ];
    
    this.write.loading = false;
  },
  reset() {
    this.write.filters = {
      search: "",
      solicitation: "all",
      location: "all",
      title: "",
      date: ""
    };
    this.write.grants = [];
    this.write.loading = false;
    this.write.showMobileFilters = false;
    this.write.pagination = {
      currentPage: 1,
      itemsPerPage: 15,
      totalItems: 0
    };
  },
  getFilteredGrants() {
    let filtered = [...this.write.grants];

    if (this.write.filters.solicitation !== "all") {
      filtered = filtered.filter(grant => 
        grant.solicitationType === this.write.filters.solicitation
      );
    }

    if (this.write.filters.location !== "all") {
      filtered = filtered.filter(grant => 
        grant.locationType === this.write.filters.location
      );
    }

    if (this.write.filters.title) {
      filtered = filtered.filter(grant =>
        grant.title.toLowerCase().includes(this.write.filters.title.toLowerCase())
      );
    }

    if (this.write.filters.date) {
      const filterDate = new Date(this.write.filters.date);
      filtered = filtered.filter(grant => {
        const closeDate = new Date(grant.closeDate);
        return closeDate >= filterDate;
      });
    }

    if (this.write.filters.search) {
      const searchLower = this.write.filters.search.toLowerCase();
      filtered = filtered.filter(grant =>
        grant.title.toLowerCase().includes(searchLower) ||
        grant.description.toLowerCase().includes(searchLower)
      );
    }

    // Update total items for pagination
    this.write.pagination.totalItems = filtered.length;

    // Apply pagination
    const { currentPage, itemsPerPage } = this.write.pagination;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    return filtered.slice(start, end);
  },
  setPage(page: number) {
    const totalPages = Math.ceil(this.write.pagination.totalItems / this.write.pagination.itemsPerPage);
    this.write.pagination.currentPage = Math.min(Math.max(1, page), totalPages);
  },
  getTotalPages() {
    return Math.ceil(this.write.pagination.totalItems / this.write.pagination.itemsPerPage);
  }
};

export type Grant = {
  id: string;
  title: string;
  description: string;
  postedDate: string;
  closeDate: string;
  amount: string;
  solicitationType: "construction" | "usaid";
  locationType: "remote" | "onsite";
};
