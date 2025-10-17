import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/models/Settings";

function fillTemplate(urlTemplate: string, admin: string, customer: string, message: string) {
  // Handle the case where we want to send to both admin and customer
  let finalUrl = urlTemplate;
  
  if (admin && customer) {
    // Both admin and customer - replace both placeholders
    finalUrl = finalUrl
      .replaceAll("[ADMIN_NUMBER]", encodeURIComponent(admin))
      .replaceAll("[CUSTOMER_NUMBER]", encodeURIComponent(customer));
  } else if (admin) {
    // Only admin - replace admin placeholder and remove customer placeholder
    finalUrl = finalUrl
      .replaceAll("[ADMIN_NUMBER]", encodeURIComponent(admin))
      .replaceAll("[CUSTOMER_NUMBER]", "");
  } else if (customer) {
    // Only customer - replace customer placeholder and remove admin placeholder
    finalUrl = finalUrl
      .replaceAll("[CUSTOMER_NUMBER]", encodeURIComponent(customer))
      .replaceAll("[ADMIN_NUMBER]", "");
  }
  
  // Clean up any commas that are left from empty replacements
  finalUrl = finalUrl
    .replace(/,\s*,/g, ',')  // Replace comma followed by comma with single comma
    .replace(/,\s*(\d)/g, '$1')  // Remove comma before number (phone number)
    .replace(/,\s*&/g, '&')  // Remove comma before &
    .replace(/,\s*$/, '');  // Remove trailing comma
  
  return finalUrl.replaceAll("[MESSAGE_BODY]", encodeURIComponent(message || ""));
}

export async function sendSmsTo(admin: string | undefined, customer: string | undefined, message: string) {
  await connectToDatabase();
  const settings = await Settings.findOne().lean();
  if (!settings || !settings.smsEnabled) return { skipped: true };
  
  try {
    const template = settings.smsUrlTemplate && settings.smsUrlTemplate.length > 0 ? settings.smsUrlTemplate : settings.smsApiUrl || "";
    if (!template) return { skipped: true, reason: "No SMS template configured" };
    
    const url = fillTemplate(template, admin || "", customer || "", message);
    console.log("SMS URL:", url);
    
    const response = await fetch(url, { 
      method: "GET", 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log("SMS Response:", responseText);
    
    // Try to parse JSON response for delivery report
    let deliveryReport = null;
    try {
      deliveryReport = JSON.parse(responseText);
    } catch {
      // If not JSON, treat as plain text response
      deliveryReport = { message: responseText, status: response.ok ? "success" : "error" };
    }
    
    return { 
      ok: response.ok, 
      status: response.status,
      deliveryReport,
      url: url.replace(/password=[^&]+/, "password=***") // Hide password in logs
    };
  } catch (e) {
    console.error("SMS Error:", e);
    return { ok: false, error: String(e) };
  }
}


