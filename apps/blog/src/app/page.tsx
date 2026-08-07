import { allPosts } from "content-collections";

export default function Home() {
  return (
    <main>
      <h1>Pink Paprikaa Blog</h1>
      <ul>
        {allPosts.map((post) => (
          <li key={post.slug}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
