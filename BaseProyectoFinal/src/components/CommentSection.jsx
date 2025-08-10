import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function CommentSection({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [postId]);

  const handleComment = async () => {
    if (!newComment.trim()) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: newComment.trim(),
      userId: currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setNewComment("");
  };

  return (
    <div style={{ marginTop: 10 }}>
      <h5>Comentarios</h5>
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <strong>{c.userId}:</strong> {c.text}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Escribe un comentario"
      />
      <button onClick={handleComment}>Comentar</button>
    </div>
  );
}
