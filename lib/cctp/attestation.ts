import { IRIS_ATTESTATION_API_URL, DEFAULT_API_DELAY } from "./constants";

export enum AttestationStatus {
  complete = "complete",
  pending_confirmations = "pending_confirmations",
}

export interface AttestationResponse {
  attestation: string | null;
  status: AttestationStatus;
}

export interface Attestation {
  message: string | null;
  status: AttestationStatus;
}

const mapAttestation = (attestationResponse: AttestationResponse): Attestation => ({
  message: attestationResponse.attestation,
  status: attestationResponse.status,
});

/**
 * Fetches attestation from Circle's attestation service
 * @param messageHash The message hash to get attestation for
 * @returns The attestation data or null if not found
 */
export async function getAttestation(
  messageHash: string
): Promise<Attestation | null> {
  try {
    const response = await fetch(`${IRIS_ATTESTATION_API_URL}/attestations/${messageHash}`);
    
    if (!response.ok) {
      // Treat 404 as pending and keep polling
      if (response.status === 404) {
        return {
          message: null,
          status: AttestationStatus.pending_confirmations,
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: AttestationResponse = await response.json();
    return mapAttestation(data);
  } catch (error) {
    console.error("Error fetching attestation:", error);
    return null;
  }
}

/**
 * Polls for attestation with exponential backoff
 * @param messageHash The message hash to poll for
 * @param maxAttempts Maximum number of polling attempts
 * @param onProgress Callback for progress updates
 * @returns The attestation when complete
 */
export async function pollForAttestation(
  messageHash: string,
  maxAttempts: number = 60, // 5 minutes with 5-second intervals
  onProgress?: (attempt: number, status: AttestationStatus) => void
): Promise<Attestation> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const attestation = await getAttestation(messageHash);
    if (attestation) {
      onProgress?.(attempts, attestation.status);
      
      if (attestation.status === AttestationStatus.complete && attestation.message) {
        return attestation;
      }
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, DEFAULT_API_DELAY));
  }
  
  throw new Error(`Attestation not available after ${maxAttempts} attempts`);
} 