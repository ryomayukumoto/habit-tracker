import React, { useEffect, useState } from "react";
import { auth, provider } from "../lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, type User } from "firebase/auth";

type Props = {
  children: (user: User) => React.ReactNode;
}

export default function AuthGate({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading , setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    })
    return () => unsub();
  }, [])

  if(loading) return <p>Loading...</p>
  
  if(!user) {
    return <button onClick={() => signInWithPopup(auth, provider)}>Googleでログイン</button>
  }
  
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
      <span>こんにちは、{user.displayName ?? "User"}さん</span>
      <button onClick={() => signOut(auth)}>ログアウト</button>
      </div>
      { children(user) }
    </>
  )
}
