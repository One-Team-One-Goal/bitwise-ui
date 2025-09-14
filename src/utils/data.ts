export async function fetchLessons(): Promise<Lesson[]> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/lessons`);
  if (!response.ok) {
    throw new Error('Failed to fetch lessons');
  }
  return await response.json();
}
// Use this in your components with useEffect or React Query for async data
export let lessons: Lesson[] = [];

fetchLessons().then(data => {
  lessons = data;
  console.log('Lessons fetched:', lessons);
}).catch(() => {
  lessons = [];
});

export interface Lesson {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
}

export interface Topic {
  id: number;
  title: string;
  lessonId: number;
  contentText: string;
  displayContent?: string; // Markdown for front-end display
  tags: string[];
  createdAt: string;
  updatedAt: string;
}