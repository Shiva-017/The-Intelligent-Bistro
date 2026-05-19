import axios from "axios";
import { CartItem, IntentResponse, MenuResponse } from "../../../packages/types/src";
import { API_BASE_URL } from "../constants/api";

const http = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

export async function fetchMenu(): Promise<MenuResponse> {
  const { data } = await http.get<MenuResponse>("/api/menu");
  return data;
}

export async function sendMessage(message: string, cart: CartItem[]): Promise<IntentResponse> {
  const { data } = await http.post<IntentResponse>("/api/order/intent", {
    message,
    cartContext: cart,
  });
  return data;
}
