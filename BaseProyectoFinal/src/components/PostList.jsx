import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import CommentSection from "./CommentSection";
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  getCountFromServer,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function PostList({ currentUser }) {
  const [posts, setPosts] = useState([]);

  const loadPosts = useCallback(async () => {
    if (!currentUser) return;

    try {
      const qOwn = query(
        collection(db, "posts"),
        where("autorId", "==", currentUser.uid)
      );
      const snapshotOwn = await getDocs(qOwn);
      const ownPosts = snapshotOwn.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const qShared = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.uid)
      );
      const snapshotShared = await getDocs(qShared);
      const sharedPosts = snapshotShared.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const allPosts = [...ownPosts, ...sharedPosts].sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.seconds || a.createdAt.toMillis() : 0;
        const dateB = b.createdAt ? b.createdAt.seconds || b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });

      const postPromises = allPosts.map(async (post) => {
        const postId = post.id;
        const likeRef = doc(db, "posts", postId, "likes", currentUser.uid);
        const likeSnap = await getDoc(likeRef);
        const liked = likeSnap.exists();

        const likesCollection = collection(db, "posts", postId, "likes");
        const likeCountSnap = await getCountFromServer(likesCollection);
        const totalLikes = likeCountSnap.data().count;

        return {
          ...post,
          liked,
          totalLikes,
        };
      });

      const postsWithLikes = await Promise.all(postPromises);
      setPosts(postsWithLikes);
    } catch (error) {
      console.error("Error al cargar posts:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const toggleLike = async (postId, alreadyLiked) => {
    const likeRef = doc(db, "posts", postId, "likes", currentUser.uid);
    if (alreadyLiked) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { timestamp: Date.now() });
    }
    await loadPosts();
  };

  const handleShare = async (post) => {
    await addDoc(collection(db, "posts"), {
      userId: currentUser.uid,
      text: post.text,
      mediaUrl: post.mediaUrl || "",
      createdAt: serverTimestamp(),
      privacy: "public",
      sharedFrom: post.id,
    });
    alert("¡Compartido en tu perfil!");
    await loadPosts();
  };

  const deletePost = async (postId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta publicación?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", postId));
      alert("Publicación eliminada.");
      await loadPosts();
    } catch (error) {
      console.error("Error al eliminar la publicación:", error);
      alert("Error al eliminar la publicación.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Publicaciones</h3>

      {posts.length === 0 && (
        <p className="text-muted">No hay publicaciones.</p>
      )}

      {posts.map((post) => (
        <div key={post.id} className="card mb-4 shadow-sm">
          <div className="card-body">
            <p className="card-text">{post.text}</p>
            {post.mediaUrl && (
              <img
                src={post.mediaUrl}
                alt="Imagen"
                className="img-fluid rounded mb-3"
              />
            )}
            {post.sharedFrom && (
              <p className="fst-italic text-secondary">
                Compartido desde otra publicación
              </p>
            )}

            <div className="d-flex align-items-center mb-3">
              <button
                className={`btn btn-sm me-2 ${
                  post.liked ? "btn-danger" : "btn-outline-danger"
                }`}
                onClick={() => toggleLike(post.id, post.liked)}
              >
                {post.liked ? "💔 Quitar Me gusta" : "❤️ Me gusta"}
              </button>
              <small className="text-muted">{post.totalLikes} Me gusta</small>
            </div>

            <CommentSection postId={post.id} currentUser={currentUser} />

            <div className="mt-3 d-flex gap-2 flex-wrap">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleShare(post)}
              >
                🔁 Compartir
              </button>

              {(post.autorId === currentUser.uid || post.userId === currentUser.uid) && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => deletePost(post.id)}
                >
                  🗑️ Eliminar publicación
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

