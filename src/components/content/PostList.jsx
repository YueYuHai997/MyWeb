import PostListItem from "./PostListItem.jsx";

export default function PostList({ section, items }) {
  return (
    <ul className="post-list">
      {items.map((item, index) => (
        <PostListItem key={item.slug} section={section} item={item} index={index} />
      ))}
    </ul>
  );
}
