
// Utility functions
export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-blue-400');
    setTimeout(() => {
      el.classList.remove('ring-2', 'ring-blue-400');
    }, 1200);
  }
};

export const getTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min === 1) return '1 min ago';
  if (min < 60) return `${min} mins ago`;
  const hr = Math.floor(min / 60);
  if (hr === 1) return '1 hour ago';
  return `${hr} hours ago`;
};

export const highlightMentions = (text: string) => {
  return text.replace(
    /@(\w+)/g,
    '<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded font-medium">@$1</span>'
  );
};

export const exportActivities = (activities: any[], filename: string = 'activities.json') => {
  const dataStr = JSON.stringify(activities, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
