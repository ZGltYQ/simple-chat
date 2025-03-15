
export function formatDate(date: Date) {
    const year = date.getFullYear(); // Get the year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month with 0-padding
    const day = String(date.getDate()).padStart(2, '0'); // Get the day with 0-padding
    const hours = String(date.getHours()).padStart(2, '0'); // Get hours with 0-padding
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes with 0-padding
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Get seconds with 0-padding
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatMessage = (message: any) => ({
    role: message.sender === 'ME' ? 'user' : 'assistant',
    content: [
      ...(message.images || []).map((image: any) => ({
        type: "image_url",
        image_url: { url: image.base64_image }
      })),
      { type: "text", text: message.text }
    ]
  });