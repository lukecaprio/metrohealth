export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${month} ${day}, ${year} at ${hours}:${minutesStr} ${ampm}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return dateString;
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
  } catch (error) {
    console.error('Time formatting error:', error);
    return dateString;
  }
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    NORMAL: 'bg-green-100 text-green-800',
    ABNORMAL: 'bg-red-100 text-red-800',
    CRITICAL: 'bg-red-600 text-white',
    PENDING: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    QUEUED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-red-100 text-red-800',
    ACKNOWLEDGED: 'bg-yellow-100 text-yellow-800',
    ESCALATED: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-green-100 text-green-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

