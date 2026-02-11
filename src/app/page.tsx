import { redirect } from 'next/navigation';

export default function Home() {
  // No authentication required - redirect directly to recipes
  redirect('/recipes');
}
