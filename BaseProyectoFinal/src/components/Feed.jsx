import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export default function Feed({ currentUser }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    async function loadFeed() {
      const followersQ = query(
        collection(db, "followers"),
        where("userId", "==", currentUser.uid)
      );
      const followersSnap = await getDocs(followersQ);
      const followedUserIds = followersSnap.docs.map((doc) => doc.data().followedUserId);

      if (followedUserIds.length === 0) {
        setPosts([]);
        return;
      }

      // Firestore permite máximo 10 ids en "in" queries
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < followedUserIds.length; i += chunkSize) {
        chunks.push(followedUserIds.slice(i, i + chunkSize));
      }

      let allPosts = [];
      for (const chunk of chunks) {
        const postsQ = query(
          collection(db, "posts"),
          where("userId", "in", chunk),
          orderBy("createdAt", "desc")
        );
        const postsSnap = await getDocs(postsQ);
        allPosts = allPosts.concat(postsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }

      // Ordenar global por fecha descendente
      allPosts.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

      setPosts(allPosts);
    }

    loadFeed();
  }, [currentUser]);

  return (
    <div>
      <h3>Feed de usuarios que sigues</h3>
      {posts.length === 0 ? (
        <p>No hay publicaciones</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
            <p>{post.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
