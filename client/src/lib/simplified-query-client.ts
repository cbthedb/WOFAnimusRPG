// Simplified client for any remaining API needs (keeping minimal for compatibility)
export const apiRequest = async (method: string, url: string, body?: any) => {
  // Placeholder for any future API needs
  throw new Error("API calls are disabled - using local storage");
};

export const queryClient = {
  invalidateQueries: () => {
    // No-op for local storage
  }
};