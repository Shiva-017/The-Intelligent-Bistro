/**
 * API configuration for The Intelligent Bistro
 *
 * When testing on a physical iPhone with Expo Go:
 *  1. Run ipconfig (Windows) or ifconfig (Mac) to find your LAN IP
 *  2. Replace the IP in API_URL with your machine's IPv4 address
 *  3. Make sure your phone and PC are on the same WiFi network
 *  4. The backend must be running: cd backend && npm run dev
 *
 * Example: if ipconfig shows 192.168.1.45, set:
 *   export const API_URL = "http://192.168.1.45:3001";
 */
export const API_URL = "http://10.0.0.18:3001";

export const CHAT_ENDPOINT = API_URL + "/chat";
export const MENU_ENDPOINT = API_URL + "/menu";
