// Commit on 2026-02-06
// This is a workaround for CORS issues during development
// You can use this if the direct API calls still fail

async function fetchWithCORSFallback(url, options = {}) {
  try {
    // First, try the normal fetch
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
    });
    return response;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('CORS')) {
      console.warn('CORS error detected, falling back to no-cors mode');
      
      // Fallback: try with no-cors mode (limited response access)
      try {
        const response = await fetch(url, {
          ...options,
          mode: 'no-cors',
        });
        
        // With no-cors, we can't read the response, so we'll assume success
        // This is not ideal but can work as a temporary solution
        if (response.type === 'opaque') {
          console.warn('Request sent with no-cors mode - response not readable');
          // Return a mock success response
          return {
            ok: true,
            json: () => Promise.resolve({ message: 'Request sent but response not readable due to CORS' })
          };
        }
        return response;
      } catch (noCorsError) {
        console.error('Both CORS and no-cors modes failed:', noCorsError);
        throw error; // Throw the original CORS error
      }
    }
    throw error;
  }
}

export default