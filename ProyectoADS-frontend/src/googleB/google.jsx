import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase/config";
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";
function Google() {
    const [idUsuario, setIdUsuario] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    
    if(token){
    const decodedToken = jwtDecode(token);
    setIdUsuario(decodedToken.id);
    }
    }, []);

  const handleVincular = async () => {
  provider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
  provider.addScope("https://www.googleapis.com/auth/classroom.announcements.readonly");
  provider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");
  provider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.me.readonly");
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken(); // JWT Firebase
    const accessToken = result._tokenResponse.oauthAccessToken;

    const { uid, email, displayName, photoURL, } = user;

    // 
    await fetch("http://localhost:3001/api/vincularGoogle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        googleId: uid,
        email,
        accessToken,
        token_expiration: new Date(Date.now() + 3600 * 1000), // 1h después
        displayName,
        photoURL,
        idUsuario,
      }),

    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
  window.location.reload();
};

  

  return (
    <button onClick={handleVincular} className="bg-blue-500 text-white px-4 py-2 rounded">
      Vincular con google
    </button>
  );
}

export default Google;
