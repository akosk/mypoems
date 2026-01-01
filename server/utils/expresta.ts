
interface ExprestaAuthResponse {
  token: string;
  expires_at: string;
}

let cachedToken: string | null = null;
let tokenExpiry: Date | null = null;

export const useExpresta = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.exprestaApiBaseUrl || 'https://api.expresta.eu';
  const apiUser = config.exprestaApiUser;
  const apiPassword = config.exprestaApiPassword;

  const getToken = async () => {
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
      return cachedToken;
    }

    if (!apiUser || !apiPassword) {
      console.warn('Expresta credentials missing');
      return null;
    }

    try {
      const res = await $fetch<ExprestaAuthResponse>('/api/v1/login', {
        baseURL: baseUrl,
        method: 'POST',
        body: {
          email: apiUser,
          password: apiPassword, // API often uses 'password' or 'api_key' depending on implementation
        },
      });

      cachedToken = res.token;
      // Assume 15 days validity or parse expires_at
      tokenExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); 
      return cachedToken;
    } catch (e) {
      console.error('Expresta Login Failed:', e);
      return null;
    }
  };

  const getPapers = async () => {
    const token = await getToken();
    if (!token) {
      // Return mock data if no token (for dev/demo)
      return [
        { id: 1, name: 'Standard Book Paper (80g)', pricePerPage: 5 },
        { id: 2, name: 'Premium Creamy (90g)', pricePerPage: 8 },
        { id: 3, name: 'Glossy White (100g)', pricePerPage: 10 },
      ];
    }

    try {
      // Actual API call
      const res = await $fetch<any>('/api/v1/data/papers', {
        baseURL: baseUrl,
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data || res;
    } catch (e) {
      console.error('Failed to fetch papers:', e);
      return [];
    }
  };

  const calculatePrice = async (options: {
    paperId: number;
    copies: number;
    pageCount: number; // We need to know how many pages the book has
  }) => {
    // In a real scenario, this would call an API endpoint like /api/v1/calculate or similar.
    // Since we don't have the exact endpoint, we'll implement a server-side logic 
    // that effectively "mimics" a price quote. 
    
    // Attempt to get real paper data
    const papers = await getPapers();
    const paper = papers.find((p: any) => p.id === options.paperId) || papers[0];
    
    const basePricePerCopy = 1500; // Binding, cover, etc.
    const pagePrice = (paper.pricePerPage || 5) * options.pageCount;
    
    const singleBookCost = basePricePerCopy + pagePrice;
    const total = singleBookCost * options.copies;
    
    // Add some "API" overhead/margin simulation
    return {
      currency: 'HUF',
      netAmount: total,
      grossAmount: Math.round(total * 1.27), // 27% VAT
      details: {
        paper: paper.name,
        pages: options.pageCount,
        copies: options.copies
      }
    };
  };

  return {
    getPapers,
    calculatePrice
  };
};
